import apiformdata from "../axios-formdata-service";
import api from "../axios-service";
import {
  BaseQueryModel,
  BaseSearchModel,
  BaseSearchQueryModel,
} from "../interface";

export interface MasterBranchModel {
  id?: number;
  code?: string;
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  taxIdNumber?: string;
  qrFileName?: string;
  qrFilePath?: string;
  qrFileOriginalName?: string;
  qrFileType?: string;
  isActive?: boolean;
  files?: File;
}

const rootApi = "/master-branch";
const _MasterBranchApi = () => {
  return {
    search: async (body: BaseSearchModel) => {
      return await api().post<BaseSearchModel, BaseSearchQueryModel>(
        `${rootApi}/search`,
        body,
      );
    },

    create: async (body: MasterBranchModel) => {
      return await apiformdata().post<MasterBranchModel, BaseQueryModel>(
        rootApi,
        body,
      );
    },

    update: async (id: number, body: MasterBranchModel) => {
      return await apiformdata().put<MasterBranchModel, BaseQueryModel>(
        `${rootApi}/${id}`,
        body,
      );
    },

    changeActiveStatus: async (id: number, isActive: boolean) => {
      return await api().put<MasterBranchModel, BaseQueryModel>(
        `${rootApi}/change-active/${id}`,
        { isActive },
      );
    },

    delete: async (id: string) => {
      return await api().delete<unknown, BaseQueryModel>(`${rootApi}/${id}`);
    },
  };
};

const _MasterBranchKey = () => {
  return {
    search: "search-master-branch",
    create: "create-master-branch",
    update: "update-master-branch",
    delete: "delete-master-branch",
  };
};

export { _MasterBranchApi, _MasterBranchKey };
