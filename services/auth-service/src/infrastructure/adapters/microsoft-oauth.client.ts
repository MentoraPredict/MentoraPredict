import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

export interface MicrosoftOAuthProfile {
  providerId: string;
  email: string;
  firstName: string;
  lastName: string;
}

const OAUTH_STATE_PURPOSE = "microsoft_oauth_state";
const GRAPH_SCOPES = "openid profile email User.Read";

@Injectable()
export class MicrosoftOAuthClient {
  private readonly logger = new Logger(MicrosoftOAuthClient.name);

  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  private get tenantId() {
    return this.config.get<string>("MICROSOFT_TENANT_ID", "common");
  }

  private get clientId() {
    return this.config.get<string>("MICROSOFT_CLIENT_ID", "");
  }

  private get clientSecret() {
    return this.config.get<string>("MICROSOFT_CLIENT_SECRET", "");
  }

  private get redirectUri() {
    return this.config.get<string>(
      "MICROSOFT_REDIRECT_URI",
      "http://localhost:8000/api/v1/auth/microsoft/callback",
    );
  }

  getAuthorizationUrl(): string {
    const state = this.jwtService.sign(
      { purpose: OAUTH_STATE_PURPOSE },
      { expiresIn: "5m" },
    );

    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: "code",
      redirect_uri: this.redirectUri,
      response_mode: "query",
      scope: GRAPH_SCOPES,
      state,
    });

    return `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
  }

  verifyState(state: string): boolean {
    try {
      const payload = this.jwtService.verify<{ purpose?: string }>(state);
      return payload.purpose === OAUTH_STATE_PURPOSE;
    } catch {
      return false;
    }
  }

  async exchangeCodeForProfile(code: string): Promise<MicrosoftOAuthProfile> {
    const tokenRes = await fetch(
      `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code,
          redirect_uri: this.redirectUri,
          grant_type: "authorization_code",
          scope: GRAPH_SCOPES,
        }),
      },
    );

    if (!tokenRes.ok) {
      const body = await tokenRes.text().catch(() => "");
      this.logger.error(`Token exchange failed (${tokenRes.status}): ${body}`);
      throw new Error("Microsoft token exchange failed");
    }

    const tokenBody = (await tokenRes.json()) as { access_token: string };

    const profileRes = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${tokenBody.access_token}` },
    });

    if (!profileRes.ok) {
      const body = await profileRes.text().catch(() => "");
      this.logger.error(`Graph profile fetch failed (${profileRes.status}): ${body}`);
      throw new Error("Microsoft Graph profile fetch failed");
    }

    const profile = (await profileRes.json()) as {
      id: string;
      mail?: string;
      userPrincipalName?: string;
      givenName?: string;
      surname?: string;
    };

    const email = profile.mail ?? profile.userPrincipalName;
    if (!email) {
      throw new Error("Microsoft account has no associated email");
    }

    return {
      providerId: profile.id,
      email: email.toLowerCase(),
      firstName: profile.givenName ?? "",
      lastName: profile.surname ?? "",
    };
  }
}
