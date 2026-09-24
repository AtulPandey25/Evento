import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  AuthResponse,
  RegisterResponse,
  SERVICES_PORTS,
  UserProfileResponse,
} from '@app/common';

@Injectable()
export class AuthService {
  private readonly authServiceUrl =
    process.env.AUTH_SERVICE_URL ||
    `http://localhost:${SERVICES_PORTS.AUTH_SERVICE}`;

  constructor(private readonly httpService: HttpService) {}

  async register(data: {
    email: string;
    password: string;
    name: string;
    role?: 'USER' | 'ORGANIZER';
  }): Promise<RegisterResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<RegisterResponse>(
          `${this.authServiceUrl}/register`,
          data,
        ),
      );

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<AuthResponse>(
          `${this.authServiceUrl}/login`,
          data,
        ),
      );

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getProfile(token: string): Promise<UserProfileResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<UserProfileResponse>(
          `${this.authServiceUrl}/profile`,
          {
            headers: { Authorization: token },
          },
        ),
      );

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: unknown): never {
    const err = error as {
      response?: { data: string | object; status: number };
    };
    if (err.response) {
      throw new HttpException(err.response.data, err.response.status);
    }
    throw new HttpException('We could not complete that action.', 503);
  }
}
