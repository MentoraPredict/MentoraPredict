# MentoraPredict Desktop User Guide

## Purpose

This guide explains how an end user installs, opens, uses, and removes the MentoraPredict desktop application on Windows.

## Requirements

- Windows 10 or Windows 11.
- Network access to the MentoraPredict backend.
- A valid MentoraPredict account.

For local testing, the backend must be running in Docker and Kong must be available at:

```text
http://127.0.0.1:8000
```

## Installer File

The installer is delivered as:

```text
MentoraPredict_Setup_1.0.0_x64.exe
```

## Installation Steps

1. Double-click `MentoraPredict_Setup_1.0.0_x64.exe`.
2. If Windows shows an "unknown publisher" warning, choose the option to continue only if the installer came from the MentoraPredict team.
3. Follow the installation assistant.
4. Keep the default installation location unless you need a custom path.
5. Finish the installation.
6. Open MentoraPredict from the desktop shortcut or the Start menu.

## Login

1. Open MentoraPredict.
2. Click `Iniciar sesion`.
3. Enter your email and password.
4. Click the login button.
5. The application redirects you to the dashboard according to your role.

## User Roles

MentoraPredict supports different experiences depending on the account role:

- Administrator: manages users and courses.
- Teacher: manages courses, students, performance, uploads, and academic insights.
- Student: views assigned courses, performance, and academic information.

## Creating a User

1. Open the registration page.
2. Fill in the required information.
3. Submit the form.
4. If registration succeeds, continue to login.

If registration fails, verify that the backend is available and that the account data is valid.

## Local Testing Notes

When testing locally, the desktop app must be generated with the local build:

```powershell
pnpm.cmd --filter @mentorapredict/desktop package:local
```

The local backend must be running before opening the desktop app. If the backend is not running, login, registration, and dashboards will fail.

## Updating the Application

To update the application:

1. Close MentoraPredict.
2. Run the new installer.
3. Follow the installation assistant.
4. Open MentoraPredict again.

For normal UI updates, installing over the previous version is usually enough.

For clean testing, uninstall the previous version first.

## Uninstalling

1. Open Windows Settings.
2. Go to `Apps`.
3. Search for `MentoraPredict`.
4. Select `Uninstall`.
5. Confirm the uninstall process.

## Troubleshooting

### The App Does Not Open

Reinstall the application using the latest installer.

### Login Fails

Check that the backend is running and reachable.

For local testing, verify:

```text
http://127.0.0.1:8000
```

### Registration Fails

Check the entered data and confirm that the backend is available.

### The Web Version Works but Desktop Does Not

This usually means the desktop installer was generated with the wrong environment or an old build. Generate a new installer with:

```powershell
pnpm.cmd --filter @mentorapredict/desktop package:local
```

Then uninstall the previous version and install the new one.

### Windows Shows an Unknown Publisher Warning

The current academic version is not digitally signed. This warning is expected unless the project is signed with a commercial code-signing certificate.
