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
  searchFields?: (keyof T | string)[];
  where?: FindOptionsWhere<T>;
  order?: Record<string, 'ASC' | 'DESC'>; // ✅ dot-notation allowed
  relations?: string[];
  filters?: Record<string, any>; // 👈 new dynamic filters
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
  filters,
}: QueryOptions<T>) {
  const skip = (page - 1) * limit;

  let searchWhere: FindOptionsWhere<T>[] = [];

  let finalWhere: FindOptionsWhere<T> = where;

  // 🔹 Add dynamic filters
  if (filters && Object.keys(filters).length > 0) {
    finalWhere = { ...finalWhere, ...filters };
  }

  if (search && searchFields.length > 0) {
    searchWhere = searchFields.map((rawField) => {
      const field = String(rawField);

      if (field.includes('.')) {
        const [relation, nestedField] = field.split('.');
        return {
          ...where,
          ...finalWhere,
          [relation]: { [nestedField]: ILike(`%${search}%`) },
        } as FindOptionsWhere<T>;
      }

      return {
        ...where,
        ...finalWhere,
        [field]: ILike(`%${search}%`),
      } as FindOptionsWhere<T>;
    });
  }

  // 🔹 Transform dot-notation into nested order object
  const buildOrder = (
    order: Record<string, 'ASC' | 'DESC'>
  ): FindOptionsOrder<T> => {
    const result: any = {};
    for (const [field, direction] of Object.entries(order)) {
      if (field.includes('.')) {
        const [relation, nestedField] = field.split('.');
        result[relation] = {
          ...(result[relation] || {}),
          [nestedField]: direction,
        };
      } else {
        result[field] = direction;
      }
    }
    return result;
  };

  const [data, total] = await repo.findAndCount({
    where: searchWhere.length > 0 ? searchWhere : finalWhere,
    order: buildOrder(order),
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
