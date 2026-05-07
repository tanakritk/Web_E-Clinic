import api from "../axios-service";
import { BaseQueryModel } from "../interface";

export interface DropdownModel {
  value: number;
  label: string;
}

const _DropdownApi = () => {
  const rootApi = "/dropdown";
  return {
    branch: async () => {
      return await api().get<BaseQueryModel>(`${rootApi}/branch`);
    },

    user: async () => {
      return await api().get<BaseQueryModel>(`${rootApi}/user`);
    },

    product: async () => {
      return await api().get<BaseQueryModel>(`${rootApi}/product`);
    },

    courses: async () => {
      return await api().get<BaseQueryModel>(`${rootApi}/courses`);
    },
  };
};

export default _DropdownApi;
