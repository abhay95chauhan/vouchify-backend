export const errorMessages = {
  auth: {
    success: {
      login: 'Logged In Successfully',
      create: 'User has been Registered',
      logout: 'Logged Out Successfully',
      found: 'User Found',
    },
    error: {
      create: 'User Already Exist',
      login: 'Invalid Email and Password',
      notFound: 'User not found',
    },
  },
  organization: {
    success: {
      found: 'Organization Found',
      create: 'Organization Created Succesfully!',
      update: 'Organization Updated Succesfully!',
    },
    error: {
      notFound: 'Organization Not Found',
    },
  },
  voucher: {
    redeemption: {
      success: {
        redeem: 'Voucher Redeemed Successfully',
        list: 'Redeemed Vouchers Fetched',
      },
    },
    success: {
      found: 'Voucher Found',
      create: 'Voucher Created Successfully',
      update: 'Voucher Updated Successfully',
      delete: 'Voucher Deleted Successfully',
      list: 'Vouchers Fetched',
    },
    error: {
      notFound: 'Voucher Not Found',
      alreadyRedeem: 'This User has Already Used This Voucher.',
      notValidOnProducts: 'This Voucher is Not Valid for the Selected Products',
      invalidCode: 'Invalid Code',
      voucherExist:
        'Voucher Already Exist with this Code, Please Change Code, Prefix or Postfix ',
      voucherNotActive: 'Voucher not yet Active',
      voucherExpired: 'Voucher has been Expired',
      voucherLimitExceeded: 'Voucher Redemption Limit Reached',
    },
  },
  smtp: {
    success: {
      configure: 'SMTP Configured',
      updateConfiguration: 'SMTP Configuration Updated',
      found: 'SMTP Configuration Found',
      mailSend: 'Mail Sent Successfully',
    },
    error: {
      alreadyConfigure: 'SMTP Already Configured',
      notConfigure: 'SMTP Not Configured',
      notFound: 'SMTP Configuration Not Found',
    },
  },
  emailTemplates: {
    success: {
      create: 'Template Created Successfully',
      found: 'Template Found',
      update: 'Template Updated Successfully',
      delete: 'Template Deleted Successfully',
      list: 'Email Templates Fetched',
    },
    error: {
      notFound: 'Template Not Found',
      alreadyExist:
        'Template With This Name Already Exist in Your Organization',
    },
  },
  userSessions: {
    success: {
      delete: 'Session Deleted Successfully',
      allDelete: 'All Session has been Revoked Successfully',
      update: 'Session Revoked Successfully',
      list: 'Sessions Fetched',
    },
    error: {
      notFound: 'Session Not Found',
    },
  },
  subcription: {
    success: {
      create: 'Subcription Created Successfully',
      update: 'Subcription Updated Successfully',
      delete: 'Subcription Deleted Successfully',
      list: 'Subcriptions Fetched',
    },
    error: {
      notFound: 'Subcription Not Found',
    },
  },
  somethingWrong: 'Something went wrong',
  invalidEmail: 'Invalid Email',
};
