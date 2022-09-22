export * from "./logger.module";
export { WINSTON_MODULE_PROVIDER as AMPLICATION_LOGGER_PROVIDER } from "nest-winston";
export {
  Logger as AmplicationLogger,
  transports as Transports,
  createLogger as CreateLogger,
} from "winston";
