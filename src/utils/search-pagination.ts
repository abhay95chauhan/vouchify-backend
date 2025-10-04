import {
  Repository,
  ILike,
  ObjectLiteral,
  FindOptionsWhere,
  FindOptionsOrder,
  MoreThan,
  LessThan,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
  Equal,
  IsNull,
  Not,
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

  let finalWhere: FindOptionsWhere<T> = { ...where };

  if (filters && Object.keys(filters).length > 0) {
    Object.entries(filters).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        if (value.eq !== undefined) {
          (finalWhere as any)[key] =
            value.eq === null ? IsNull() : Equal(value.eq);
        }
        if (value.neq !== undefined) {
          (finalWhere as any)[key] =
            value.neq === null ? Not(IsNull()) : Not(value.neq);
        }

        if (value.gt !== undefined)
          (finalWhere as any)[key] = MoreThan(value.gt);
        if (value.gte !== undefined)
          (finalWhere as any)[key] = MoreThanOrEqual(value.gte);
        if (value.lt !== undefined)
          (finalWhere as any)[key] = LessThan(value.lt);
        if (value.lte !== undefined)
          (finalWhere as any)[key] = LessThanOrEqual(value.lte);
        if (value.between !== undefined && Array.isArray(value.between))
          (finalWhere as any)[key] = Between(
            value.between[0],
            value.between[1]
          );
      } else if (value === null) {
        // ✅ explicit IS NULL
        (finalWhere as any)[key] = IsNull();
      } else {
        (finalWhere as any)[key] = value;
      }
    });
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
