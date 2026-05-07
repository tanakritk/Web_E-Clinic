import api from "../axios-service";
import {
  BaseQueryModel,
  BaseSearchModel,
  BaseSearchQueryModel,
} from "../interface";

export interface SaleScheduleModel {
  date: string;
  time: string;
  isFree?: boolean;
}

export interface SaleItemModel {
  id?: number;
  itemType: "Course" | "Product";
  courseId?: number;
  productId?: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  schedules?: SaleScheduleModel[];
}

export interface CreateSaleModel {
  amount: number;
  vat?: number;
  discount?: number;
  totalAmount: number;
  saleDate: string | Date;
  customerId: number;
  branchId: number;
  items: SaleItemModel[];
  payment: "QR Code" | "เงินสด" | "บัตรเครดิต";
}

export interface UpdateSaleModel extends Partial<CreateSaleModel> {
  status?: string;
}

export interface SearchSaleModel extends BaseSearchModel {
  advanceFilter?: {
    branchId?: number;
    customerId?: number;
  };
}

const rootApi = "/sale";

const _SaleApi = () => {
  return {
    search: async (body: SearchSaleModel) => {
      return await api().post<SearchSaleModel, BaseSearchQueryModel>(
        `${rootApi}/search`,
        body,
      );
    },

    create: async (body: CreateSaleModel) => {
      return await api().post<CreateSaleModel, BaseQueryModel>(rootApi, body);
    },

    update: async (id: number | string, body: UpdateSaleModel) => {
      return await api().put<UpdateSaleModel, BaseQueryModel>(
        `${rootApi}/${id}`,
        body,
      );
    },

    delete: async (id: number | string) => {
      return await api().delete<unknown, BaseQueryModel>(`${rootApi}/${id}`);
    },
  };
};

const _SaleKey = () => {
  return {
    search: "search-sale",
    create: "create-sale",
    update: "update-sale",
    delete: "delete-sale",
  };
};

export { _SaleApi, _SaleKey };
