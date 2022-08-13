const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/user');
const Service = require('../models/newservice');
const Website = require('../models/website');
const Appointment = require('../models/Appointment');
const Portfolio = require('../models/PortfolioViews');
//test
const isAuth = (isAuth) => {
  const Errors = [];

  if (!isAuth) {
    const error = new Error('Not authenticated!');
    error.code = 401;
    throw error;
  }
};

module.exports = {
  createUser: async ({ userInput }, req, next) => {
    const errors = [];
    if (!validator.isEmail(userInput.email)) {
      errors.push({ message: 'E-Mail is invalid.' });
    }
    if (
      validator.isEmpty(userInput.password) ||
      !validator.isLength(userInput.password, { min: 4 })
    ) {
      errors.push({ message: 'Password too short!' });
    }
    if (errors.length > 0) {
      const error = new Error('Invalid input.');
      error.data = errors;
      error.code = 422;
      throw error;
    }
    const existingUserEmail = await User.findOne({ email: userInput.email });
    const existingUsername = await User.findOne({
      username: userInput.username,
    });
    if (existingUserEmail) {
      const error = new Error('Email already has an account!');
      throw error;
    }
    if (existingUsername) {
      const error = new Error('Username is taken!');
      throw error;
    }

    const hashedPw = await bcrypt.hash(userInput.password, 12);

    const user = new User({
      firstname: userInput.firstname,
      lastname: userInput.lastname,
      email: userInput.email,
      username: userInput.username,
      phone: userInput.phone,
      role: userInput.role,
      password: hashedPw,
    });
    const createdUser = await user.save();
    if (createdUser.role === 'staff') {
      const websiteId = mongoose.Types.ObjectId(userInput.website);
      const website = await Website.findById(websiteId);
      website.staff = [...website.staff, createdUser._id];
      await website.save();
    }

    const token = jwt.sign(
      {
        userId: createdUser._id.toString(),
        email: createdUser.email,
      },
      process.env.JWT_SECRET
    );

    return { token: token, userId: user._id.toString() };
  },
  login: async function ({ username, password, domain }) {
    //Hardcoded

    if (!domain) {
      domain = 'test';
    }
    const errors = [];
    const user = await User.findOne({ username });
    const website = await Website.findOne({ domain });
    if (!website) {
      const error = new Error('Website not found!');
      throw error;
    }
    console.log('website', website);
    if (!user) {
      const error = new Error('User not found!');
      throw error;
    }

    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error('Password is incorrect.');
      error.code = 401;
      throw error;
    }
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      process.env.JWT_SECRET
    );
    return {
      token: token,
      userId: user._id.toString(),
      webId: website._id.toString(),
      userInfo: {
        ...user._doc,
        _id: user._id.toString(),
        date: user.date.toISOString(),
      },
    };
  },

  createService: async ({ userInput }, req, next) => {
    isAuth(req.isAuth);
    if (req.isAuth) {
      const user = await User.findById(req.userId);
      if (!user) {
        const error = new error('invalid User');
        error.code = 401;
        throw error;
      }
      console.log('1user', user);
      if (user.role === 'admin') {
        const service = new Service({
          website: mongoose.Types.ObjectId(userInput.website),
          serviceName: userInput.name,
          duration: userInput.duration,
          description: userInput.description,
          cost: userInput.cost,
        });
        const createdService = await service.save();
        return {
          ...createdService._doc,
          cost: parseFloat(createdService.cost),
          duration: parseInt(createdService.duration),
          _id: createdService._id.toString(),
        };
      }

      const error = new error('User needs to be an Admin');
      error.code = 401;
      throw error;
    }
    const error = new error('User Not Authorize');
    error.code = 401;
    throw error;
  },
  createWebsite: async ({ userInput }, req, next) => {
    isAuth(req.isAuth);
    if (req.isAuth) {
      const user = await User.findById(req.userId);
      if (!user) {
        const error = new error('invalid User');
        error.code = 401;
        throw error;
      }

      if (user.role === 'admin') {
        console.log('req.isAuth', req.isAuth);
        const website = new Website({
          admin: req.userId,
          name: userInput.name,
          domain: userInput.domain,
          schedule: userInput.schedule,
        });
        const createdWebsite = await website.save();
        return {
          name: createdWebsite.name,
        };
      }

      const error = new error('User needs to be an Admin');
      error.code = 401;
      throw error;
    }
    const error = new error('User Not Authorize');
    error.code = 401;
    throw error;
  },

  createAppointment: async ({ AppointmentInput }, req, next) => {
    isAuth(req.isAuth);
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new error('invalid User');
      error.code = 401;
      throw error;
    }

    // converts string id to mongoose id
    const websiteId = mongoose.Types.ObjectId(AppointmentInput.website);
    const website = await Website.findById(websiteId);
    if (!website) {
      const error = new error('Website not Found!');
      error.code = 401;
      throw error;
    }
    //check if customer is already in website
    const customer = mongoose.Types.ObjectId(AppointmentInput.customer);
    const alreadyInWebsite = website.customers.includes(customer);

    //CHECK IF FALSE SO WE CAN ADD CUSTOMER TO THE WEBSITE ARRAY
    if (!alreadyInWebsite) {
      website.customers = [...website.customers, customer];
      await website.save();
    }

    const service = mongoose.Types.ObjectId(AppointmentInput.service);
    const staff = mongoose.Types.ObjectId(AppointmentInput.staff);
    const start = new Date(AppointmentInput.start);
    const end = new Date(AppointmentInput.end);
    const appointment = new Appointment({
      website: website,
      creator: user,
      service,
      customer,
      staff,
      start,
      end,
    });
    const createdAppointment = await appointment.save();

    return {
      ...createdAppointment._doc,
      website: createdAppointment.website.toString(),
      _id: createdAppointment._id.toString(),
      start: createdAppointment.start.toISOString(),
      end: createdAppointment.end.toISOString(),
      dateCreated: createdAppointment.dateCreated.toISOString(),
    };
  },

  greet: async function (res, req, next) {
    console.log('1user', req);
    if (!req.isAuth) {
      const error = new Error('Not authenticated!');
      error.code = 401;
      throw error;
    }

    if (req.isAuth) {
      const user = await User.findById(req.userId);
      if (!user) {
        const error = new error('invalid User');
        error.code = 401;
        throw error;
      }
      console.log('1user', user);
    }
    return {
      name: 'Jane Doe',
      message: 'Hello, wokjjkjkrld!',
    };
  },
  //helps record views for my own portfolio website
  portfolio: async function (req) {
    const id = mongoose.Types.ObjectId('62def5215f573927ad3459f8');
    const portfolio = await Portfolio.findById(id);
    portfolio.visits = portfolio.visits + 1;

    const updatedportfolio = await portfolio.save();
    return {
      name: 'Jane Doe',
      message: 'Hello, wokjjkjkrld!',
    };
  },
  userInfo: async function (res, req, next) {
    isAuth(req.isAuth);
    const errors = [];
    if (req.isAuth) {
      const user = await User.findById(req.userId);
      if (!user) {
        const error = new error('invalid User');
        error.code = 401;
        throw error;
      }

      return { ...user._doc, _id: user._id.toString() };
    }
    const error = new error('Not Valid credentials');
    error.code = 401;
    throw error;
  },
  //takes page and website ID
  appointments: async function ({ page }, req, next) {
    //console.log('----------user', user.username);
    isAuth(req.isAuth);
    const user = await User.findById(req.userId);
    console.log('----------user', user.username);
    if (!page) {
      page = 1;
    }
    let appointments, totalAppointments;
    if (user.role === 'staff') {
      appointments = await Appointment.find({
        staff: req.userId,
      })
        .populate('creator')
        .populate('customer')
        .populate('staff')
        .populate('service');

      totalAppointments = await Appointment.find({
        staff: req.userId,
      }).countDocuments();
    }
    if (user.role === 'customer') {
      appointments = await Appointment.find({
        customer: req.userId,
      })
        .populate('creator')
        .populate('customer')
        .populate('staff')
        .populate('service');

      totalAppointments = await Appointment.find({
        customer: req.userId,
      }).countDocuments();
    }
    if (user.role === 'admin') {
      website = await Website.find({
        admin: user._id,
      });
      appointments = await Appointment.find({
        website: website._id,
      })
        .populate('creator')
        .populate('customer')
        .populate('staff')
        .populate('service');

      totalAppointments = await Appointment.find({
        website: website._id,
      }).countDocuments();
    }

    return {
      appointments: appointments.map((appt) => {
        return {
          ...appt._doc,
          _id: appt._id.toString(),
          end: appt.end.toString(),
          start: appt.start.toString(),
          dateCreated: appt.dateCreated.toISOString(),
        };
      }),
      totalAppointments,
    };
  },
  getCustomers: async function (res, req, next) {
    isAuth(req.isAuth);

    const totalCustomers = await User.find({
      role: 'customer',
    }).countDocuments();
    const totalStaff = await User.find({
      role: 'staff',
    }).countDocuments();
    const users = await User.find({ role: 'customer' });
    const staff = await User.find({ role: 'staff' });
    console.log(users);
    return {
      customers: users.map((customer) => {
        return {
          ...customer._doc,
          _id: customer._id.toString(),
          date: customer.date.toISOString(),
        };
      }),
      totalCustomers,
      totalStaff,

      staff: staff.map((person) => {
        return {
          ...person._doc,
          _id: person._id.toString(),
          date: person.date.toISOString(),
        };
      }),
    };
  },
  updateAppointment: async function ({ id, AppointmentInput }, req, next) {
    isAuth(req.isAuth);

    const appointment = await Appointment.findById(id)
      .populate('staff')
      .populate('customer')
      .populate('user')
      .populate('service');

    if (!appointment) {
      const error = new Error('No Appointment found!');
      error.code = 404;
      throw error;
    }
    // if (appointment.creator._id.toString() !== req.userId.toString()) {
    //   const error = new Error('Not Authorize!');
    //   error.code = 404;
    //   throw error;
    // }

    if (AppointmentInput.start !== undefined)
      appointment.start = new Date(AppointmentInput.start);

    if (AppointmentInput.end !== undefined)
      appointment.end = new Date(AppointmentInput.end);

    appointment.customer =
      AppointmentInput.customer !== undefined
        ? mongoose.Types.ObjectId(AppointmentInput.customer)
        : appointment.customer;

    appointment.staff =
      AppointmentInput.staff !== undefined
        ? mongoose.Types.ObjectId(AppointmentInput.staff)
        : appointment.staff;

    appointment.service =
      AppointmentInput.service !== undefined
        ? mongoose.Types.ObjectId(AppointmentInput.service)
        : appointment.service;

    appointment.completed =
      AppointmentInput.completed !== undefined
        ? AppointmentInput.completed
        : appointment.completed;
    appointment.status =
      AppointmentInput.status !== undefined
        ? AppointmentInput.status
        : appointment.status;

    const updatedAppointment = await appointment.save();

    return {
      ...updatedAppointment._doc,
      _id: updatedAppointment._id.toString(),
      end: updatedAppointment.end.toISOString(),
      start: updatedAppointment.start.toISOString(),
      dateCreated: updatedAppointment.dateCreated.toISOString(),
    };
  },
  getWebsite: async function ({ domain }, req, next) {
    // converts string id to mongoose id
    const user = await User.findById(req.userId);
    let website;

    if (user.role === 'admin') {
      website = await Website.findOne({
        admin: user._id,
      })
        .populate('customers')
        .populate('staff');
    }

    if (user.role === 'staff') {
      website = await Website.findOne({
        staff: req.userId,
      })
        .populate('customers')
        .populate('staff');
      console.log('sstaff website', website);
    } else {
      website = await Website.findOne({
        domain,
      })
        .populate('customers')
        .populate('staff');
    }

    if (!website) {
      const error = new error('Website not Found!');
      error.code = 401;
      throw error;
    }
    const services = await Service.find({
      website: website._id,
    });
    console.log('servicess', services);
    //plan cannot be called tostring when plan is empty
    return {
      website: {
        ...website._doc,
        _id: website._id.toString(),
        admin: website.admin.toString(),
        dateCreated: website.dateCreated.toISOString(),
        lastVisit: website.lastVisit.toISOString(),
      },

      staff: website.staff.map((person) => {
        return {
          ...person._doc,
          _id: person._id.toString(),
          date: person.date.toISOString(),
        };
      }),
      customers: website.customers.map((customer) => {
        return {
          ...customer._doc,
          _id: customer._id.toString(),
          date: customer.date.toISOString(),
        };
      }),
      services: services.map((service) => {
        return {
          ...service._doc,
          cost: parseFloat(service.cost),
          duration: parseInt(service.duration),
          _id: service._id.toString(),
          website: service.website.toString(),
          dateCreated: service.dateCreated.toISOString(),
        };
      }),
    };
  },
};
