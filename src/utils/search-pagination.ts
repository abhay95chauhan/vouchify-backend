import {
  Repository,
  ILike,
  ObjectLiteral,
  FindOptionsWhere,
  FindOptionsOrder,
} from 'typeorm';

interface QueryOptions<T extends ObjectLiteral> {
  repo: Repository<T>;
  page?: number;
  limit?: number;
  search?: string;
  searchFields?: (keyof T | string)[]; // allow both
  where?: FindOptionsWhere<T>;
  order?: FindOptionsOrder<T>;
  relations?: string[];
}

export async function paginateAndSearch<T extends ObjectLiteral>({
  repo,
  page = 1,
  limit = 10,
  search = '',
  searchFields = [],
  where = {},
  order = {},
  relations = [],
}: QueryOptions<T>) {
  const skip = (page - 1) * limit;

  let searchWhere: FindOptionsWhere<T>[] = [];

  if (search && searchFields.length > 0) {
    searchWhere = searchFields.map((rawField) => {
      const field = String(rawField); // ✅ always treat as string

      if (field.includes('.')) {
        // nested relation like "organization.name"
        const [relation, nestedField] = field.split('.');
        return {
          ...where,
          [relation]: { [nestedField]: ILike(`%${search}%`) },
        } as FindOptionsWhere<T>;
      }

      return {
        ...where,
        [field]: ILike(`%${search}%`),
      } as FindOptionsWhere<T>;
    });
  }

  const [data, total] = await repo.findAndCount({
    where: searchWhere.length > 0 ? searchWhere : where,
    order,
    take: limit,
    skip,
    relations,
  });

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
