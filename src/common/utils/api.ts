"use client";

import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { getAccessToken } from "./access-token.util";
import { delay } from "./generic.util";

const api = () => {
  let header;
  const accessToken = getAccessToken();

  if (!header) {
    header = { Accept: "application/json", "Content-Type": "application/json" };
  }

  const apiSet = axios.create({
    baseURL: process.env.NEXT_PUBLIC_MAIN_URL,
    headers: accessToken
      ? { ...header, Authorization: `Bearer ${accessToken}` }
      : header,
  });

  apiSet.interceptors.response.use(
    async (response: any) => {
      const method = response.config?.method || "";

      if (["get", "post", "patch", "delete"].includes(method)) {
        enqueueSnackbar("Successfully", { variant: "success" });
        await delay(700);
        return response;
      }
      return response;
    },
    (error: any) => {
      if (error.message === "Network Error") {
        enqueueSnackbar(error.message, {
          variant: "error",
        });
        throw error;
      }
      if (error.response.status === 401 && typeof window === "object") {
        localStorage.removeItem("user");
        window.location.href = "/";
      }
      let { message } = error.response.data;

      if (!message) {
        message =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
      }

      if (Array.isArray(message)) {
        message.forEach((element) => {
          enqueueSnackbar("Got Error", {
            variant: "error",
          });
        });
      } else {
        if (message !== "Record Not Found") {
          enqueueSnackbar("Got Error", {
            variant: "error",
          });
        }
      }
      return error.response;
    }
  );

  return apiSet;
};

export default api;
