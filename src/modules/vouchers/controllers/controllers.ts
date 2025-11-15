import { NextFunction, Request, Response } from 'express';
import { catchAsync } from '../../../utils/catch-async';
import { AppDataSource } from '../../../database';
import { VouchersEntity } from '../entity/entity';
import { AppError } from '../../../utils/app-error';
import { errorMessages } from '../../../utils/error-messages';
import { paginateAndSearch } from '../../../utils/search-pagination';
import { sendOrgTemplateMailService } from '../../smtp/helpers/send-mail';
import { predefinedEmailTemplates } from '../../email-templates/helpers/config';
import { validateVoucher } from './validate-voucher';
import { FindOptionsWhere, In } from 'typeorm';
import { generateBulkVoucherCodes } from '../helpers/voucher-code-generator';
import { parseCSV } from '../helpers/csv-parser';
import { discountType, redeemPerUser } from '../helpers/config';

const createOrganizationVoucher = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const voucherRepo = AppDataSource.getRepository(VouchersEntity);

    const resData = await voucherRepo.findOneBy({
      code: req.body.code,
    });

    if (resData) {
      next(new AppError(errorMessages.voucher.error.voucherExist, 409));
      return;
    }

    const newVoucher = voucherRepo.create({
      ...req.body,
      organization_id: req.user.organization_id,
    });
    const savedVoucher: any = await voucherRepo.save(newVoucher); // actually saves to DB

    res.status(201).json({
      code: 201,
      message: errorMessages.voucher.success.create,
      status: 'success',
      data: savedVoucher,
    });
  }
);

const getVoucherByCode = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.params.code) {
      next(new AppError(errorMessages.voucher.error.notFound, 404));
      return;
    }

    const voucherRepo = AppDataSource.getRepository(VouchersEntity);
    const resData = await voucherRepo.findOneBy({
      code: req.params.code,
      organization_id: req.user.organization_id,
    });

    if (!resData) {
      next(new AppError(errorMessages.voucher.error.notFound, 404));
      return;
    }

    return res.status(200).json({
      code: 200,
      message: errorMessages.voucher.success.found,
      status: 'success',
      data: resData,
    });
  }
);

const updateOrganizationVoucher = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const voucherRepo = AppDataSource.getRepository(VouchersEntity);

    const existVoucherData = await voucherRepo.findOneBy({
      code: req.params.code,
      organization_id: req.user.organization_id,
    });

    if (!existVoucherData) {
      next(new AppError(errorMessages.voucher.error.notFound, 404));
      return;
    }

    await voucherRepo.update(
      { code: req.params.code },
      { ...req.body, updated_at: new Date() }
    );

    res.status(200).json({
      code: 200,
      message: errorMessages.voucher.success.update,
      status: 'success',
      data: existVoucherData,
    });
  }
);

const deleteOrganizationVoucher = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.params.code) {
      next(new AppError(errorMessages.voucher.error.notFound, 404));
      return;
    }

    const voucherRepo = AppDataSource.getRepository(VouchersEntity);

    const existVoucherData = await voucherRepo.findOneBy({
      code: req.params.code,
      organization_id: req.user.organization_id,
    });

    if (!existVoucherData) {
      next(new AppError(errorMessages.voucher.error.notFound, 404));
      return;
    }

    await voucherRepo.delete({ code: req.params.code });

    res.status(200).json({
      code: 200,
      message: errorMessages.voucher.success.delete,
      status: 'success',
      data: existVoucherData,
    });
  }
);

const deleteAllOrganizationVouchers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const voucherRepo = AppDataSource.getRepository(VouchersEntity);

    await voucherRepo.delete({ organization_id: req.user.organization_id });

    res.status(200).json({
      code: 200,
      message: errorMessages.voucher.success.deleteAll,
      status: 'success',
      data: [],
    });
  }
);

const validateVoucherByCode = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { code, orderAmount, productIds = [], email } = req.body;

    try {
      const result = await validateVoucher({
        code,
        orderAmount,
        productIds,
        user: req.user,
        email,
      });

      return res.status(200).json({
        code: 200,
        message: errorMessages.voucher.success.found,
        status: 'success',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
);

const getAllOrganizationVouchers = catchAsync(
  async (req: Request, res: Response) => {
    const vouchersRepo = AppDataSource.getRepository(VouchersEntity);

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const orderBy = (req.query.orderBy as string) || 'ASC';
    const orderByField = (req.query.orderByField as string) || 'name';
    const filters =
      (req.body.filters as FindOptionsWhere<VouchersEntity>) || {};

    const { data, pagination } = await paginateAndSearch<VouchersEntity>({
      repo: vouchersRepo,
      page: page,
      limit: limit,
      search: search,
      searchFields: ['name', 'code', 'prefix', 'postfix'],
      where: { organization_id: req.user.organization_id },
      order: { [orderByField]: orderBy as 'ASC' | 'DESC' }, // ✅ type-checked
      filters,
    });

    return res.status(200).json({
      code: 200,
      message: errorMessages.voucher.success.list,
      status: 'success',
      data,
      pagination,
    });
  }
);

const sendVoucherInMail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { code, email } = req.body;

    if (!email) {
      next(new AppError(errorMessages.invalidEmail, 400));
      return;
    }

    if (!code) {
      next(new AppError(errorMessages.voucher.error.invalidCode, 404));
      return;
    }

    const voucherRepo = AppDataSource.getRepository(VouchersEntity);
    const voucherData = await voucherRepo.findOneBy({
      code: code,
      organization_id: req.user.organization_id,
    });

    if (!voucherData) {
      next(new AppError(errorMessages.voucher.error.invalidCode, 404));
      return;
    }

    const mailres = await sendOrgTemplateMailService<VouchersEntity>({
      entityData: voucherData,
      organization_id: req.user.organization_id,
      templateName: predefinedEmailTemplates.VOUCHER,
      sendTo: email,
    });

    return res.status(200).json({
      code: 200,
      message: errorMessages.smtp.success.mailSend,
      status: 'success',
      data: mailres,
    });
  }
);

const getRecentVouchers = catchAsync(async (req: Request, res: Response) => {
  const vouchersRepo = AppDataSource.getRepository(VouchersEntity);

  const page = parseInt(req.query.page as string) || 1;
  const search = (req.query.search as string) || '';
  const orderBy = (req.query.orderBy as string) || 'DESC';
  const orderByField = (req.query.orderByField as string) || 'created_at';
  const filters = (req.body.filters as FindOptionsWhere<VouchersEntity>) || {};

  const { data, pagination } = await paginateAndSearch<VouchersEntity>({
    repo: vouchersRepo,
    page: page,
    limit: 5,
    search: search,
    searchFields: ['name', 'code', 'prefix', 'postfix'],
    where: { organization_id: req.user.organization_id },
    order: { [orderByField]: orderBy as 'ASC' | 'DESC' }, // ✅ type-checked
    filters,
  });

  return res.status(200).json({
    code: 200,
    message: errorMessages.voucher.success.recentVoucherFetch,
    status: 'success',
    data,
    pagination,
  });
});

const bulkGenerateVouchers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      count,
      prefix = '',
      suffix = '',
      length = 8,
      name,
      description,
      discount_type,
      discount_value,
      max_redemptions,
      min_order_amount,
      start_date,
      end_date,
      redeem_limit_per_user,
      max_discount_amount,
      eligible_products = [],
    } = req.body;

    if (!count || count < 1 || count > 1000) {
      next(
        new AppError('Count must be between 1 and 1000 vouchers per batch', 400)
      );
      return;
    }

    if (
      !name ||
      !discount_type ||
      !discount_value ||
      !start_date ||
      !end_date
    ) {
      next(
        new AppError(
          'Missing required fields: name, discount_type, discount_value, start_date, end_date',
          400
        )
      );
      return;
    }

    if (!discountType.includes(discount_type)) {
      next(
        new AppError('Invalid discount_type. Must be Fixed or Percentage', 400)
      );
      return;
    }

    if (length < 4 || length > 20) {
      next(new AppError('Length must be between 4 and 20 characters', 400));
      return;
    }

    const voucherRepo = AppDataSource.getRepository(VouchersEntity);

    // Get existing codes to avoid duplicates
    const existingVouchers = await voucherRepo.find({
      where: { organization_id: req.user.organization_id },
      select: ['code'],
    });
    const existingCodes = new Set(existingVouchers.map((v) => v.code));

    // Generate unique voucher codes
    const codes = generateBulkVoucherCodes(
      count,
      prefix,
      suffix,
      length,
      existingCodes
    );

    // Prepare vouchers data for bulk insert
    const vouchersData = codes.map((code) => ({
      name: `${name} - ${code}`,
      description,
      code,
      prefix,
      postfix: suffix,
      discount_type,
      discount_value: parseInt(discount_value),
      max_redemptions: max_redemptions ? parseInt(max_redemptions) : null,
      min_order_amount: min_order_amount ? parseInt(min_order_amount) : 0,
      start_date,
      end_date,
      redeem_limit_per_user: redeem_limit_per_user || redeemPerUser[1],
      max_discount_amount: max_discount_amount
        ? parseInt(max_discount_amount)
        : null,
      eligible_products: Array.isArray(eligible_products)
        ? eligible_products
        : [],
      organization_id: req.user.organization_id,
    }));

    // Bulk insert vouchers using TypeORM insert (more efficient than save)
    await voucherRepo.insert(vouchersData);

    // Fetch the inserted vouchers to return in response
    const savedVouchers = await voucherRepo.find({
      where: {
        organization_id: req.user.organization_id,
        code: In(codes),
      },
      order: { created_at: 'DESC' },
    });

    return res.status(201).json({
      code: 201,
      message: errorMessages.voucher.success.bulkCreate,
      status: 'success',
      data: {
        count: savedVouchers.length,
        vouchers: savedVouchers,
      },
    });
  }
);

const importVouchersFromCSV = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const file = (req as any).file;
    if (!file) {
      next(new AppError('No CSV file provided', 400));
      return;
    }

    const voucherRepo = AppDataSource.getRepository(VouchersEntity);

    try {
      // Parse CSV file
      const csvContent = file.buffer.toString('utf-8');
      const records = await parseCSV(csvContent);

      if (records.length === 0) {
        next(new AppError('CSV file is empty or has no valid data', 400));
        return;
      }

      if (records.length > 1000) {
        next(
          new AppError('Maximum 1000 vouchers can be imported at once', 400)
        );
        return;
      }

      // Get existing codes to avoid duplicates
      const existingVouchers = await voucherRepo.find({
        where: { organization_id: req.user.organization_id },
        select: ['code'],
      });
      const existingCodes = new Set(existingVouchers.map((v) => v.code));

      const vouchers: VouchersEntity[] = [];
      const errors: Array<{ row: number; error: string }> = [];
      const skipped: Array<{ row: number; code: string; reason: string }> = [];

      // Validate and prepare vouchers
      records.forEach((record: any, index: number) => {
        const row = index + 2; // +2 because index is 0-based and CSV has header

        try {
          // Required fields validation
          if (
            !record.code ||
            !record.name ||
            !record.discount_type ||
            !record.discount_value
          ) {
            errors.push({
              row,
              error:
                'Missing required fields: code, name, discount_type, discount_value',
            });
            return;
          }

          // Check for duplicate codes
          if (existingCodes.has(record.code.toUpperCase())) {
            skipped.push({
              row,
              code: record.code,
              reason: 'Code already exists',
            });
            return;
          }

          // Validate discount_type
          if (!discountType.includes(record.discount_type)) {
            errors.push({
              row,
              error: `Invalid discount_type: ${record.discount_type}. Must be Fixed or Percentage`,
            });
            return;
          }

          // Validate dates
          if (!record.start_date || !record.end_date) {
            errors.push({
              row,
              error: 'Missing required dates: start_date, end_date',
            });
            return;
          }

          const voucher = voucherRepo.create({
            name: record.name,
            description: record.description || '',
            code: record.code.toUpperCase(),
            prefix: record.prefix || '',
            postfix: record.postfix || '',
            discount_type: record.discount_type,
            discount_value: parseInt(record.discount_value),
            max_redemptions: record.max_redemptions
              ? parseInt(record.max_redemptions)
              : null,
            min_order_amount: record.min_order_amount
              ? parseInt(record.min_order_amount)
              : 0,
            start_date: record.start_date,
            end_date: record.end_date,
            redeem_limit_per_user:
              record.redeem_limit_per_user || redeemPerUser[1],
            max_discount_amount: record.max_discount_amount
              ? parseInt(record.max_discount_amount)
              : null,
            eligible_products: record.eligible_products
              ? record.eligible_products.split(',').map((p: string) => p.trim())
              : [],
            organization_id: req.user.organization_id,
          });

          vouchers.push(voucher);
          existingCodes.add(record.code.toUpperCase());
        } catch (error: any) {
          errors.push({
            row,
            error: error.message || 'Invalid data format',
          });
        }
      });

      if (vouchers.length === 0) {
        return res.status(400).json({
          code: 400,
          message: 'No valid vouchers to import',
          status: 'error',
          data: {
            total: records.length,
            successful: 0,
            errors,
            skipped,
          },
        });
      }

      // Batch insert valid vouchers
      const savedVouchers = await voucherRepo.save(vouchers);

      return res.status(201).json({
        code: 201,
        message: errorMessages.voucher.success.csvImport,
        status: 'success',
        data: {
          total: records.length,
          successful: savedVouchers.length,
          failed: errors.length,
          skipped: skipped.length,
          errors: errors.length > 0 ? errors : undefined,
          skippedRows: skipped.length > 0 ? skipped : undefined,
          vouchers: savedVouchers,
        },
      });
    } catch (error: any) {
      next(new AppError(`Failed to process CSV file: ${error.message}`, 400));
      return;
    }
  }
);

const exportVouchersToCSV = catchAsync(async (req: Request, res: Response) => {
  const voucherRepo = AppDataSource.getRepository(VouchersEntity);

  // Build query
  const queryBuilder = voucherRepo
    .createQueryBuilder('voucher')
    .where('voucher.organization_id = :organizationId', {
      organizationId: req.user.organization_id,
    });

  const vouchers = await queryBuilder.getMany();

  // Generate CSV content
  const csvHeaders = [
    'code',
    'name',
    'description',
    'prefix',
    'postfix',
    'discount_type',
    'discount_value',
    'max_redemptions',
    'redemption_count',
    'min_order_amount',
    'start_date',
    'end_date',
    'redeem_limit_per_user',
    'max_discount_amount',
    'eligible_products',
    'last_redeemed_at',
    'created_at',
    'updated_at',
  ];

  const csvRows = vouchers.map((voucher) => {
    return [
      voucher.code,
      voucher.name,
      voucher.description || '',
      voucher.prefix || '',
      voucher.postfix || '',
      voucher.discount_type,
      voucher.discount_value,
      voucher.max_redemptions || '',
      voucher.redemption_count,
      voucher.min_order_amount,
      voucher.start_date,
      voucher.end_date,
      voucher.redeem_limit_per_user || '',
      voucher.max_discount_amount || '',
      voucher.eligible_products?.join(',') || '',
      voucher.last_redeemed_at
        ? new Date(voucher.last_redeemed_at).toISOString()
        : '',
      new Date(voucher.created_at).toISOString(),
      new Date(voucher.updated_at).toISOString(),
    ];
  });

  const csvContent = [
    csvHeaders.join(','),
    ...csvRows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  // Set response headers for CSV download
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=vouchers_${
      new Date().toISOString().split('T')[0]
    }.csv`
  );

  return res.status(200).send(csvContent);
});

export const vouchersController = {
  getRecentVouchers,
  getAllOrganizationVouchers,
  createOrganizationVoucher,
  getVoucherByCode,
  updateOrganizationVoucher,
  deleteOrganizationVoucher,
  validateVoucherByCode,
  sendVoucherInMail,
  bulkGenerateVouchers,
  importVouchersFromCSV,
  exportVouchersToCSV,
  deleteAllOrganizationVouchers,
};
