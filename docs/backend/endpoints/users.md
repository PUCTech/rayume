# Users

Table: `users`. The signed-in user is always `/me`; there is no `/users/{public_id}` for other people's private data.

## User object

Returned by `GET /me`, `PATCH /me` and inside `TokenResponse`.

```json
{
  "public_id": "V1StGXR8_Z5j",
  "username": "raulkolaric",
  "email": "raul@example.com",
  "name": "Raul Kolaric",
  "profession": "Backend Developer",
  "summary": "About me text",
  "phone": "+55 11 99999-0000",
  "address": "São Paulo, BR",
  "picture_url": "https://storage.../signed",
  "language": "en",
  "links": [{ "label": "GitHub", "url": "https://github.com/raulkolaric" }],
  "has_password": true,
  "github_connected": true,
  "google_connected": false,
  "created_at": "2026-11-06T18:25:00Z",
  "updated_at": "2026-11-06T18:25:00Z"
}
```

- `has_password`, `github_connected`, `google_connected` are derived from `password_hash`, `github_id`, `google_id`. Those columns are never returned.
- `picture_url` is a short-lived signed URL built from the stored path. Null when there is no picture.
- `disabled_at` is never returned: a disabled user can't get a token.

### GET /me

- `200` User object.
- `401` no valid token.

### PATCH /me

Every field optional. Email and password changes are not covered here (see "Not covered").

| Body field | Type | Rules |
|------------|------|-------|
| `username` | string | 3 to 30, `^[a-z0-9_-]+$`, not reserved, lowercased. Old profile links break (no redirects) |
| `name` | string | 1 to 100 |
| `profession` | string \| null | max 100 |
| `summary` | string \| null | max 2000 |
| `phone` | string \| null | max 30, kept as text |
| `address` | string \| null | max 200 |
| `language` | string | `en` or `pt-BR` |
| `links` | array \| null | max 10 items of `{label: string (1-40), url: http(s) URL}` |

- `200` updated User object.
- `409` `username_taken`.
- `422` validation.

Profile changes don't touch saved resumes: each resume version is a snapshot.

### PUT /me/picture

`multipart/form-data` with one field `file`.

| Field | Rules |
|-------|-------|
| `file` | `image/jpeg`, `image/png` or `image/webp`, max 2 MB. Type checked from the file bytes, not the header |

- `200` updated User object. The file goes to object storage; `picture_url` stores its path. The old file is deleted.
- `413` too large. `422` wrong type.

### DELETE /me

Disables the account (soft delete). No body.

- `204`. In one transaction: `disabled_at = now()` and every refresh token revoked. Clears the refresh cookie. Logs `user.disabled`.
- Rows stay. Login and token validation now reject the user. Reactivation is a manual/admin operation, not an endpoint. A hard (LGPD) delete is a separate explicit operation, also not an endpoint.

## Public profile

### GET /users/{username}

No auth. Backs the `/u/{username}` frontend page.

| Param | In | Rules |
|-------|----|-------|
| `username` | path | matched lowercased |

- `200`:
  ```json
  {
    "username": "raulkolaric",
    "name": "Raul Kolaric",
    "profession": "Backend Developer",
    "summary": "About me text",
    "picture_url": "https://storage.../signed",
    "links": [{ "label": "GitHub", "url": "https://github.com/raulkolaric" }]
  }
  ```
  Never includes email, phone, address or ids.
- `404` unknown **or disabled** user.

## Not covered

- Changing email or password, and password reset by email: no table or flow for verification codes yet.
- Connecting/disconnecting a provider on an existing account (beyond the automatic email link in OAuth).
