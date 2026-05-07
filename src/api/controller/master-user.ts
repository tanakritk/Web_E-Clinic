import api from "../axios-service";
import {
  BaseQueryModel,
  BaseSearchModel,
  BaseSearchQueryModel,
} from "../interface";
import { MasterBranchModel } from "./master-branch";

export interface MasterUserModel {
  id?: number;
  code?: string;
  username?: string;
  password?: string;
  title?: string;
  firstname?: string;
  surname?: string;
  address?: string;
  idCardNumber?: string;
  phone?: string;
  birthday?: string; // หรือใช้ Date ถ้าคุณต้องการจัดการเป็น Object วันที่
  isActive?: boolean;
  isRefactorPassword?: boolean;
  sex?: string;
  role?: string;
  nickname?: string;
  branchId?: number;
  mas_branch?: MasterBranchModel;
}

interface UpdatePasswordModel {
  password: string;
}

const rootApi = "/master-user";
const _MasterUserApi = () => {
  return {
    search: async (body: BaseSearchModel) => {
      return await api().post<BaseSearchModel, BaseSearchQueryModel>(
        `${rootApi}/search`,
        body,
      );
    },

    create: async (body: MasterUserModel) => {
      return await api().post<MasterUserModel, BaseQueryModel>(rootApi, body);
    },

    update: async (id: number, body: MasterUserModel) => {
      return await api().put<MasterUserModel, BaseQueryModel>(
        `${rootApi}/${id}`,
        body,
      );
    },

    delete: async (id: string) => {
      return await api().delete<unknown, BaseQueryModel>(`${rootApi}/${id}`);
    },

    // ------------------------------------------------------------------------------------- //

    resetPassword: async (id: number) => {
      return await api().put(`${rootApi}/reset-password/${id}`, {});
    },

    updatePassword: async (id: number, payload: UpdatePasswordModel) => {
      return await api().put(`${rootApi}/update-password/${id}`, payload);
    },

    changeActiveStatus: async (id: number, isActive: boolean) => {
      return await api().put<MasterUserModel, BaseQueryModel>(
        `${rootApi}/change-active/${id}`,
        { isActive },
      );
    },
  };
};

const _MasterUserKey = () => {
  return {
    search: "search-master-user",
    create: "create-master-user",
    update: "update-master-user",
    delete: "delete-master-user",
    resetPassword: "reset-password-master-user",
    updatePassword: "update-password-master-user",
  };
};

export { _MasterUserApi, _MasterUserKey };
