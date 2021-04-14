import axios from "axios";
import { AppError } from "error-api.hl";

export class WorldTimeApiConfig {
  apiRetry: number;
  apiRetryTime: number;
  worldtimeapi: string;
}

export class WorldTimeApi {
  constructor(private config?: WorldTimeApiConfig) {}

  async getTimeBy(timezone: string, retryCount?: number) {
    try {
      const response = await axios.get(
        `${this.config.worldtimeapi}${timezone}`
      );

      return response.data;
    } catch (err) {
      this.retry((count) => this.getTimeBy(timezone, count), retryCount, err);
    }
  }

  getAllTimezones(): Promise<any> {
    return axios.get(this.config.worldtimeapi);
  }

  retry(func: Function, retryCount: number, err) {
    //retry strategy
    if (
      err.response.status == 503 &&
      (!retryCount || retryCount <= this.config.apiRetry)
    ) {
      setTimeout(
        (_) => func(retryCount ? retryCount++ : 1),
        this.config.apiRetryTime
      );
    }

    throw new AppError("world api error", err);
  }
}
