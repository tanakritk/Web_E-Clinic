import api from "../axios-service";
import {
  BaseQueryModel,
  BaseSearchModel,
  BaseSearchQueryModel,
} from "../interface";
import { MasterBranchModel } from "./master-branch";
import { MasterProductModel } from "./master-product";

export interface SearchStockModel extends BaseSearchModel {
  advanceFilter?: {
    branchId?: number;
  };
}

export interface StockModel {
  id?: number;
  quantity?: number;
  description?: string;
  mas_product?: MasterProductModel;
  mas_branch?: MasterBranchModel;

  // -------------------------- //
  branchId?: number;
  productId?: number;
}

const rootApi = "/stock";
const _StockApi = () => {
  return {
    search: async (body: BaseSearchModel) => {
      return await api().post<BaseSearchModel, BaseSearchQueryModel>(
        `${rootApi}/search`,
        body,
      );
    },

    create: async (body: StockModel) => {
      return await api().post<StockModel, BaseQueryModel>(rootApi, body);
    },

    import: async (body: StockModel) => {
      return await api().post<StockModel, BaseQueryModel>(
        `${rootApi}/import`,
        body,
      );
    },

    update: async (id: number, body: StockModel) => {
      return await api().put<StockModel, BaseQueryModel>(
        `${rootApi}/${id}`,
        body,
      );
    },

    delete: async (id: string) => {
      return await api().delete<unknown, BaseQueryModel>(`${rootApi}/${id}`);
    },
  };
};

const _StockKey = () => {
  return {
    search: "search-stock",
    create: "create-stock",
    update: "update-stock",
    delete: "delete-stock",
  };
};

export { _StockApi, _StockKey };
