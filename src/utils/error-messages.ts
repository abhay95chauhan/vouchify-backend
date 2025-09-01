export const errorMessages = {
  auth: {
    success: {
      login: 'Logged In Successfully',
      create: 'User has been Registered',
      logout: 'Logged Out Successfully',
      found: 'User Found',
    },
    error: {
      create: 'User Already Exist',
      login: 'Invalid Email and Password',
      notFound: 'User not found',
    },
  },
  organization: {
    success: {
      found: 'Organization Found',
      create: 'Organization Created Succesfully!',
      update: 'Organization Updated Succesfully!',
    },
    error: {
      notFound: 'Organization Not Found',
    },
  },
  voucher: {
    success: {
      found: 'Voucher Found',
      create: 'Voucher Created Successfully',
      update: 'Voucher Updated Successfully',
      delete: 'Voucher Deleted Successfully',
    },
    error: {
      notFound: 'Voucher Not Found',
      invalidCode: 'Invalid Code',
      voucherExist:
        'Voucher Already Exist with this Code, Please Change Code, Prefix or Postfix ',
      voucherNotActive: 'Voucher not yet Active',
      voucherExpired: 'Voucher has been Expired',
      voucherLimitExceeded: 'Voucher Redemption Limit Reached',
    },
  },
  smtp: {
    success: {
      configure: 'SMTP Configured',
      updateConfiguration: 'SMTP Configuration Updated',
      found: 'SMTP Configuration Found',
    },
    error: {
      alreadyConfigure: 'SMTP Already Configured',
      notFound: 'SMTP Configuration Not Found',
    },
  },
  emailTemplates: {
    success: {
      create: 'Template Created Successfully',
      found: 'Template Found',
      update: 'Template Updated Successfully',
      delete: 'Template Deleted Successfully',
      list: 'Email Templates Fetched',
    },
    error: {
      notFound: 'Template Not Found',
    },
  },
  somethingWrong: 'Something went wrong',
};
