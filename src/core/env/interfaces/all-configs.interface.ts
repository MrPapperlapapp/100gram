import { IJwtConfig } from "./jwt.interface";
import { IPgAdapter } from "@/core/env/interfaces/pg-adapter.interface";

export interface IAllConfigsInterface {
	jwt: IJwtConfig;
	pg: IPgAdapter;
}
