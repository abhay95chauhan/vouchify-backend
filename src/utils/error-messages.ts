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
      login: 'Invalid email and password',
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
    success: {
      found: 'Voucher Found',
      create: 'Voucher Created Successfully',
      update: 'Voucher Updated Successfully',
    },
    error: {
      notFound: 'Voucher Not Found',
      voucherExist:
        'Voucher Already Exist with this Code, Please Change Code, Prefix or Postfix ',
    },
  },
  somethingWrong: 'Something went wrong',
};
