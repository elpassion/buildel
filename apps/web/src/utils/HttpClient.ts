import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { ENV } from '~/env.mjs';

export type TAxiosErrorInterceptor = (error: AxiosError) => AxiosError;

export interface IHttpClientOptions {
  url: string;
  authCookie?: string;
  useRequestConfig?: (
    requestConfig: InternalAxiosRequestConfig,
  ) => Promise<InternalAxiosRequestConfig>;
  onErrorInterceptor?: TAxiosErrorInterceptor;
}

export class HttpClient {
  private static instance: HttpClient;
  private readonly client: AxiosInstance;
  private readonly options: IHttpClientOptions;

  constructor(options: IHttpClientOptions) {
    this.options = options;
    this.client = axios.create({
      baseURL: this.options.url,
      headers: this.getHeaders(),
    });

    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) =>
      this.options.useRequestConfig
        ? this.options.useRequestConfig(config)
        : config,
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        return this.options.onErrorInterceptor
          ? Promise.reject(this.options.onErrorInterceptor(error))
          : Promise.reject(error);
      },
    );
  }

  public static getInstance(options: IHttpClientOptions): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient(options);
    }
    return HttpClient.instance;
  }

  async get<TReturnType>(
    url: string,
    { params }: { params?: Record<string, unknown> } = {},
  ): Promise<TReturnType> {
    const { data } = await this.client.get<TReturnType>(url, {
      params,
    });
    return data;
  }

  async post<TRequestDataType, TReturnType = void>(
    url: string,
    requestData: TRequestDataType,
    config?: AxiosRequestConfig,
  ): Promise<TReturnType> {
    const { data } = await this.client.post<
      TRequestDataType,
      AxiosResponse<TReturnType>
    >(url, requestData, config);
    return data;
  }

  async put<TRequestDataType, TReturnType = void>(
    url: string,
    requestData: TRequestDataType,
    config?: AxiosRequestConfig,
  ): Promise<TReturnType> {
    const { data } = await this.client.put<
      TRequestDataType,
      AxiosRequestConfig
    >(url, requestData, config);

    return data;
  }

  async patch<TRequestDataType, TReturnType = void>(
    url: string,
    requestData: TRequestDataType,
    config?: AxiosRequestConfig,
  ): Promise<TReturnType> {
    const { data } = await this.client.patch<
      TRequestDataType,
      AxiosResponse<TReturnType>
    >(url, requestData, config);
    return data;
  }

  async delete<TRequestDataType, TReturnType = void>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<TReturnType> {
    const { data } = await this.client.delete<
      TRequestDataType,
      AxiosResponse<TReturnType>
    >(url, config);

    return data;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(this.options.authCookie
        ? { Cookie: `_buildel_key=${this.options.authCookie}` }
        : {}),
    };
  }
}

export const createHttpClient = () => {
  return HttpClient.getInstance({ url: `${ENV.PAGE_URL}/api` });
};
