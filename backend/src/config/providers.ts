import { EmailProvider, RecoveryMethod } from '../types';

export interface ProviderSeedData {
  provider: EmailProvider;
  name: string;
  logo: string;
  domains: string[];
  recoveryUrl: string;
  supportedMethods: RecoveryMethod[];
  hasOAuth: boolean;
  documentationUrl: string;
  instructions: Record<string, string[]>;
  isActive: boolean;
}

export const defaultProviders: ProviderSeedData[] = [
  {
    provider: EmailProvider.GMAIL,
    name: 'Google / Gmail / Workspace',
    logo: 'https://www.gstatic.com/images/branding/product/2x/gmail_2020q4_48dp.png',
    domains: ['gmail.com', 'googlemail.com'],
    recoveryUrl: 'https://accounts.google.com/signin/recovery',
    hasOAuth: true,
    documentationUrl: 'https://support.google.com/accounts/answer/7682439',
    supportedMethods: [
      RecoveryMethod.RECOVERY_EMAIL,
      RecoveryMethod.RECOVERY_PHONE,
      RecoveryMethod.BACKUP_CODES,
      RecoveryMethod.AUTHENTICATOR_APP,
      RecoveryMethod.TRUSTED_DEVICE,
      RecoveryMethod.ACCOUNT_RECOVERY_FORM,
    ],
    instructions: {
      [RecoveryMethod.RECOVERY_EMAIL]: [
        'Navigate to the official Google Account Recovery portal at https://accounts.google.com/signin/recovery',
        'Enter your full Gmail or Google Workspace email address and click "Next".',
        'If prompted for a password you do not know, select "Try another way".',
        'Choose "Get a verification code at [your recovery email]".',
        'Log in to your secondary recovery email and locate the 6-digit verification code from Google.',
        'Enter the 6-digit code on the Google recovery page.',
        'Create a new strong, unique password to complete recovery.',
      ],
      [RecoveryMethod.RECOVERY_PHONE]: [
        'Open Google Account Recovery page (https://accounts.google.com/signin/recovery).',
        'Enter your email address and click Next.',
        'Click "Try another way" if prompted for password.',
        'Select "Get a verification code via text message or phone call" at your registered phone number.',
        'Enter the 6-digit SMS code (G-XXXXXX) into the prompt.',
        'Upon successful verification, reset your account password and review recent security events.',
      ],
      [RecoveryMethod.BACKUP_CODES]: [
        'Visit https://accounts.google.com/signin/recovery and enter your Google account email.',
        'Click "Try another way" until you see "Enter one of your 8-digit backup codes".',
        'Retrieve your stored 8-digit backup code from your MailVault secure vault.',
        'Enter the single-use backup code and proceed.',
        'Immediately regenerate new backup codes from Google Account settings once access is restored.',
      ],
      [RecoveryMethod.TRUSTED_DEVICE]: [
        'On a device or browser where you previously signed in to Google, visit https://accounts.google.com/signin/recovery.',
        'Enter your email address.',
        'Google will send a prompt ("Is it you trying to recover your account?") to your smartphone or tablet.',
        'Tap "Yes" on your phone and match the number displayed on the screen.',
        'Follow on-screen instructions to set a new password.',
      ],
      [RecoveryMethod.ACCOUNT_RECOVERY_FORM]: [
        'If automated recovery options fail, navigate through the Google Account Recovery workflow on a familiar network/device.',
        'Answer as many security verification questions as accurately as possible.',
        'Provide the approximate month/year when the account was created and previously used passwords.',
        'Provide a contact email where Google support can send status updates within 48-72 hours.',
      ],
    },
    isActive: true,
  },
  {
    provider: EmailProvider.OUTLOOK,
    name: 'Microsoft Outlook / Hotmail / Live',
    logo: 'https://res.cdn.office.net/assets/mail/pwa/v1/pngs/apple-touch-icon.png',
    domains: ['outlook.com', 'hotmail.com', 'live.com', 'msn.com', 'passport.com'],
    recoveryUrl: 'https://account.live.com/acsr',
    hasOAuth: true,
    documentationUrl: 'https://support.microsoft.com/en-us/account-billing/help-with-the-microsoft-account-recovery-form-b19c02d1-a782-dee6-93c3-dc8113b20c42',
    supportedMethods: [
      RecoveryMethod.RECOVERY_EMAIL,
      RecoveryMethod.RECOVERY_PHONE,
      RecoveryMethod.AUTHENTICATOR_APP,
      RecoveryMethod.BACKUP_CODES,
      RecoveryMethod.ACCOUNT_RECOVERY_FORM,
    ],
    instructions: {
      [RecoveryMethod.RECOVERY_EMAIL]: [
        'Go to https://account.live.com/password/reset and enter your Microsoft account email address.',
        'Select "Email [your recovery email]" as your identity verification method.',
        'Verify the hidden characters of your recovery email address to request the security code.',
        'Check your secondary email inbox for the single-use security code from Microsoft.',
        'Enter the code and set a new password.',
      ],
      [RecoveryMethod.RECOVERY_PHONE]: [
        'Go to https://account.live.com/password/reset and input your Outlook/Hotmail account.',
        'Choose "Text [last 4 digits of phone number]" to receive a verification SMS.',
        'Confirm the last 4 digits of your phone number to dispatch the SMS code.',
        'Input the security code received on your phone and follow prompts to reset your password.',
      ],
      [RecoveryMethod.ACCOUNT_RECOVERY_FORM]: [
        'Open the Microsoft Account Recovery Form at https://account.live.com/acsr',
        'Enter the Microsoft account you are trying to recover and a working contact email address.',
        'Fill in the ACSR form with as much detail as possible: subject lines of recent emails, Skype contacts, billing info, Xbox gamertag.',
        'Submit the form. Microsoft automated systems will review your submission and reply within 24 hours.',
      ],
      [RecoveryMethod.BACKUP_CODES]: [
        'Go to Microsoft sign-in or password reset portal.',
        'Select "Use a 25-character recovery code" if 2-Step Verification is enabled.',
        'Enter the 25-character recovery code saved in your MailVault.',
        'Reset your credentials upon authentication.',
      ],
    },
    isActive: true,
  },
  {
    provider: EmailProvider.YAHOO,
    name: 'Yahoo Mail',
    logo: 'https://s.yimg.com/rz/p/yahoo_frontpage_en-US_s_f_p_bestfit_frontpage_2x.png',
    domains: ['yahoo.com', 'ymail.com', 'rocketmail.com'],
    recoveryUrl: 'https://login.yahoo.com/forgot',
    hasOAuth: true,
    documentationUrl: 'https://help.yahoo.com/kb/sln2051.html',
    supportedMethods: [
      RecoveryMethod.RECOVERY_EMAIL,
      RecoveryMethod.RECOVERY_PHONE,
      RecoveryMethod.SUPPORT_CONTACT,
    ],
    instructions: {
      [RecoveryMethod.RECOVERY_EMAIL]: [
        'Visit Yahoo Sign-in Helper at https://login.yahoo.com/forgot',
        'Enter your Yahoo email address or mobile phone number.',
        'Click "Continue" and choose to send a verification code to your recovery email.',
        'Retrieve the 6-digit confirmation code from your recovery inbox.',
        'Enter the code on Yahoo and proceed to update your login password.',
      ],
      [RecoveryMethod.RECOVERY_PHONE]: [
        'Navigate to https://login.yahoo.com/forgot.',
        'Enter your Yahoo email address.',
        'Select your phone number to receive a verification SMS or automated call.',
        'Enter the verification code received on your mobile device.',
        'Create a new password once ownership is verified.',
      ],
      [RecoveryMethod.SUPPORT_CONTACT]: [
        'If automated recovery methods are unreachable, visit Yahoo Help Central (https://help.yahoo.com).',
        'Select "Sign-in and Password" and follow instructions to connect with Yahoo Premium Support.',
      ],
    },
    isActive: true,
  },
  {
    provider: EmailProvider.ICLOUD,
    name: 'Apple iCloud Mail',
    logo: 'https://www.apple.com/v/icloud/b/images/overview/icloud_icon__d098e9i9m6k2_large.png',
    domains: ['icloud.com', 'me.com', 'mac.com'],
    recoveryUrl: 'https://iforgot.apple.com',
    hasOAuth: false,
    documentationUrl: 'https://support.apple.com/en-us/HT201487',
    supportedMethods: [
      RecoveryMethod.TRUSTED_DEVICE,
      RecoveryMethod.RECOVERY_PHONE,
      RecoveryMethod.RECOVERY_EMAIL,
      RecoveryMethod.BACKUP_CODES,
      RecoveryMethod.ID_VERIFICATION,
    ],
    instructions: {
      [RecoveryMethod.TRUSTED_DEVICE]: [
        'On an authorized Apple device (iPhone, iPad, Mac), open Settings > [Your Name] > Sign-In & Security > Change Password.',
        'Enter your device passcode to immediately reset your Apple ID / iCloud password.',
        'If using a web browser, visit https://iforgot.apple.com and enter your Apple ID.',
        'Apple will send a notification to your trusted Apple devices with a verification code.',
      ],
      [RecoveryMethod.RECOVERY_PHONE]: [
        'Go to https://iforgot.apple.com and enter your @icloud.com Apple ID.',
        'Enter your trusted phone number associated with your Apple ID.',
        'Choose "Cannot access trusted devices" to request an SMS verification code.',
        'Follow prompts to initiate Account Recovery if two-factor devices are inaccessible.',
      ],
      [RecoveryMethod.BACKUP_CODES]: [
        'If Account Recovery key was generated in Apple ID settings, navigate to https://iforgot.apple.com.',
        'Select "Use 28-character Recovery Key".',
        'Enter the exact 28-character key stored in your MailVault.',
        'Set up new authentication credentials.',
      ],
    },
    isActive: true,
  },
  {
    provider: EmailProvider.ZOHO,
    name: 'Zoho Mail',
    logo: 'https://www.zoho.com/mail/images/zoho-mail-logo.svg',
    domains: ['zoho.com', 'zohomail.com'],
    recoveryUrl: 'https://accounts.zoho.com/signin?servicename=VirtualOffice#forgot',
    hasOAuth: true,
    documentationUrl: 'https://www.zoho.com/mail/help/recovery-options.html',
    supportedMethods: [
      RecoveryMethod.RECOVERY_EMAIL,
      RecoveryMethod.RECOVERY_PHONE,
      RecoveryMethod.BACKUP_CODES,
      RecoveryMethod.AUTHENTICATOR_APP,
    ],
    instructions: {
      [RecoveryMethod.RECOVERY_EMAIL]: [
        'Visit the Zoho Account Recovery page at https://accounts.zoho.com/signin#forgot',
        'Enter your registered Zoho Mail username or email address.',
        'Select "Send verification code to recovery email".',
        'Check your recovery email inbox and input the verification code.',
        'Enter and confirm your new account password.',
      ],
      [RecoveryMethod.RECOVERY_PHONE]: [
        'Open https://accounts.zoho.com/signin#forgot and input your email address.',
        'Select "Send OTP to mobile number".',
        'Enter the OTP received on your mobile device.',
        'Reset your Zoho account password.',
      ],
      [RecoveryMethod.BACKUP_CODES]: [
        'During Zoho Multi-Factor Authentication prompt, click "Use Backup Verification Code".',
        'Enter an unused backup code from your MailVault storage.',
        'Access your Zoho account settings to re-configure MFA if necessary.',
      ],
    },
    isActive: true,
  },
  {
    provider: EmailProvider.PROTONMAIL,
    name: 'Proton Mail',
    logo: 'https://proton.me/assets/favicon.ico',
    domains: ['protonmail.com', 'proton.me', 'pm.me'],
    recoveryUrl: 'https://account.proton.me/reset-password',
    hasOAuth: false,
    documentationUrl: 'https://proton.me/support/reset-password',
    supportedMethods: [
      RecoveryMethod.RECOVERY_EMAIL,
      RecoveryMethod.RECOVERY_PHONE,
      RecoveryMethod.BACKUP_CODES,
    ],
    instructions: {
      [RecoveryMethod.RECOVERY_EMAIL]: [
        'Navigate to https://account.proton.me/reset-password',
        'Enter your Proton Mail username or address.',
        'Choose "Recovery Email" and request the verification link/code.',
        'IMPORTANT: Due to zero-knowledge encryption, resetting your password without a recovery phrase or data key will make previous encrypted emails unreadable until the old password is provided.',
        'Enter verification code and set new account password.',
      ],
      [RecoveryMethod.RECOVERY_PHONE]: [
        'Visit https://account.proton.me/reset-password and enter your username.',
        'Choose "SMS" to send a security code to your registered phone number.',
        'Enter the security code to proceed with password reset.',
      ],
      [RecoveryMethod.BACKUP_CODES]: [
        'If 2FA is active on Proton Mail, click "Use a two-factor recovery code" on the 2FA challenge screen.',
        'Enter your stored single-use Proton backup code.',
      ],
    },
    isActive: true,
  },
  {
    provider: EmailProvider.GMX,
    name: 'GMX Mail',
    logo: 'https://www.gmx.com/favicon.ico',
    domains: ['gmx.com', 'gmx.net', 'gmx.de'],
    recoveryUrl: 'https://service.gmx.com/help/account-recovery',
    hasOAuth: false,
    documentationUrl: 'https://support.gmx.com/',
    supportedMethods: [
      RecoveryMethod.RECOVERY_EMAIL,
      RecoveryMethod.RECOVERY_PHONE,
      RecoveryMethod.SECURITY_QUESTIONS,
    ],
    instructions: {
      [RecoveryMethod.RECOVERY_EMAIL]: [
        'Go to the GMX login portal and click "Forgot password?".',
        'Input your GMX email address.',
        'Select to receive a recovery link at your alternative email address.',
        'Click the verification link within 2 hours to choose a new password.',
      ],
      [RecoveryMethod.RECOVERY_PHONE]: [
        'On the GMX password reset page, select SMS verification.',
        'Enter the code delivered to your registered mobile phone.',
        'Create a new password.',
      ],
    },
    isActive: true,
  },
  {
    provider: EmailProvider.AOL,
    name: 'AOL Mail',
    logo: 'https://s.yimg.com/rz/p/aol_frontpage_en-US_s_f_p_bestfit_frontpage_2x.png',
    domains: ['aol.com', 'aim.com'],
    recoveryUrl: 'https://login.aol.com/forgot',
    hasOAuth: true,
    documentationUrl: 'https://help.aol.com/articles/restore-access-to-your-account',
    supportedMethods: [
      RecoveryMethod.RECOVERY_EMAIL,
      RecoveryMethod.RECOVERY_PHONE,
      RecoveryMethod.SUPPORT_CONTACT,
    ],
    instructions: {
      [RecoveryMethod.RECOVERY_EMAIL]: [
        'Go to https://login.aol.com/forgot',
        'Enter your AOL username or email address.',
        'Select your recovery email to receive the verification code.',
        'Enter the 6-digit verification code to reset your password.',
      ],
      [RecoveryMethod.RECOVERY_PHONE]: [
        'Navigate to AOL Sign-in Helper (https://login.aol.com/forgot).',
        'Enter your AOL email address.',
        'Select your phone number to receive an SMS confirmation code.',
        'Enter the code and finalize the new password.',
      ],
    },
    isActive: true,
  },
  {
    provider: EmailProvider.YANDEX,
    name: 'Yandex Mail',
    logo: 'https://yastatic.net/icon-logo/favicon.ico',
    domains: ['yandex.com', 'yandex.ru', 'ya.ru'],
    recoveryUrl: 'https://passport.yandex.com/restoration',
    hasOAuth: true,
    documentationUrl: 'https://yandex.com/support/id/en/authorization/recovery',
    supportedMethods: [
      RecoveryMethod.RECOVERY_PHONE,
      RecoveryMethod.RECOVERY_EMAIL,
      RecoveryMethod.SECURITY_QUESTIONS,
      RecoveryMethod.ACCOUNT_RECOVERY_FORM,
    ],
    instructions: {
      [RecoveryMethod.RECOVERY_PHONE]: [
        'Go to Yandex Access Restoration portal: https://passport.yandex.com/restoration',
        'Enter your Yandex login, email, or linked phone number.',
        'Receive the SMS verification code on your verified mobile phone.',
        'Enter the SMS code and enter a new password.',
      ],
      [RecoveryMethod.RECOVERY_EMAIL]: [
        'Visit https://passport.yandex.com/restoration and enter your account login.',
        'Choose verification via recovery email.',
        'Input the code from the Yandex restoration email.',
        'Create a new password.',
      ],
    },
    isActive: true,
  },
  {
    provider: EmailProvider.CUSTOM,
    name: 'Custom Domain / Business Email',
    logo: '',
    domains: [],
    recoveryUrl: '',
    hasOAuth: false,
    documentationUrl: '',
    supportedMethods: [
      RecoveryMethod.SUPPORT_CONTACT,
      RecoveryMethod.RECOVERY_EMAIL,
      RecoveryMethod.BACKUP_CODES,
    ],
    instructions: {
      [RecoveryMethod.SUPPORT_CONTACT]: [
        'Contact your domain administrator, IT department, or web hosting provider (e.g. cPanel, Plesk, Google Workspace admin, Microsoft 365 admin).',
        'Request an administrator-initiated password reset or temporary recovery token.',
        'Verify your employment or domain ownership identity with your organization.',
      ],
      [RecoveryMethod.RECOVERY_EMAIL]: [
        'Log in to your webmail hosting control panel (e.g. cPanel, Roundcube, Fastmail, Namecheap).',
        'Use the "Reset Password" function on your domain webmail URL.',
        'Check the configured administrative or secondary recovery address.',
      ],
    },
    isActive: true,
  },
  {
    provider: EmailProvider.OTHER,
    name: 'Other IMAP / SMTP Email Provider',
    logo: '',
    domains: [],
    recoveryUrl: '',
    hasOAuth: false,
    documentationUrl: '',
    supportedMethods: [
      RecoveryMethod.RECOVERY_EMAIL,
      RecoveryMethod.SUPPORT_CONTACT,
    ],
    instructions: {
      [RecoveryMethod.RECOVERY_EMAIL]: [
        'Navigate to your specific email provider webmail login portal.',
        'Locate the "Forgot Password" or "Account Recovery" link.',
        'Follow provider-specific instructions to receive a verification code at your recovery email.',
      ],
      [RecoveryMethod.SUPPORT_CONTACT]: [
        'Contact the customer support or technical service desk of your email hosting company.',
        'Be prepared to verify account ownership using recent billing statements, domain WHOIS records, or registered personal details.',
      ],
    },
    isActive: true,
  },
];
