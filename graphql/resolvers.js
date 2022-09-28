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
const Staff = require('../models/Staff');
const WorkoutUser = require('../models/workoutStats/user');
const Sets = require('../models/workoutStats/sets');
const Exercise = require('../models/workoutStats/exercise');
const Category = require('../models/workoutStats/categories');
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
      const staff = new Staff({
        staffInfo: createdUser._id,
        website: websiteId,
      });
      const createdStaff = await staff.save();
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
  UpdateStaff: async function ({ offerServices, schedule }, req, next) {
    console.log('test', offerServices);

    isAuth(req.isAuth);
    const errors = [];
    if (req.isAuth) {
      const user = await User.findById(req.userId);
      const staff = await Staff.find({
        staffInfo: req.userId,
      })
        .populate('staffInfo')
        .populate('website')
        .populate('offerServices')
        .populate('currentAppointments');
      console.log('---staff', staff);
      if (!user) {
        const error = new error('invalid User');
        error.code = 401;
        throw error;
      }
      if (!staff) {
        const error = new error('invalid Staff');
        error.code = 401;
        throw error;
      }

      staff.offerServices = services !== undefined && [
        ...staff.offerServices,
        offerServices,
      ];
      staff.schedule = schedule !== undefined && schedule;

      return { ...staff._doc, _id: staff._id.toString() };
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
  // everything related to workout stats app
  createWorkoutUser: async function ({ userInput }) {
    const errors = [];
    const { firstname, password, email, lastname } = userInput;

    if (!validator.isEmail(email)) {
      errors.push({ message: 'E-Mail is invalid.' });
    }
    if (
      validator.isEmpty(userInput.password) ||
      !validator.isLength(password, { min: 4 })
    ) {
      errors.push({ message: 'Password too short!' });
    }

    const existingUserEmail = await WorkoutUser.findOne({
      where: { email: email },
    });

    if (existingUserEmail) {
      const error = new Error('Email already has an account!');
      throw error;
    }
    const hashedPw = await bcrypt.hash(password, 12);

    const createdUser = await WorkoutUser.create({
      firstname: firstname,
      lastname: lastname,
      password: hashedPw,
      email: email,
    });

    const token = jwt.sign(
      {
        userId: createdUser.id.toString(),
        email: createdUser.email,
      },
      process.env.JWT_SECRET
    );

    return {
      token: token,
      userInfo: {
        id: createdUser.id,
        email: createdUser.email,
        password: createdUser.password,
        firstname: createdUser.firstname,
        lastname: createdUser.lastname,
        createdAt: createdUser.createdAt.toISOString(),
        updatedAt: createdUser.updatedAt.toISOString(),
      },
    };
  },
  workoutLogin: async function ({ email, password }) {
    const errors = [];
    console.log('------test');
    const user = await WorkoutUser.findOne({ where: { email } });
    console.log('user===', user);

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
        userId: user.id.toString(),
        email: user.email,
      },
      process.env.JWT_SECRET
    );
    return {
      token: token,
      userInfo: {
        id: user.id,
        email: user.email,
        password: user.password,
        firstname: user.firstname,
        lastname: user.lastname,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    };
  },
  createCategory: async function ({ name }, req, next) {
    isAuth(req.isAuth);
    const errors = [];

    const existingCategory = await Category.findOne({
      where: {
        name: name,
        userId: req.userId,
      },
    });

    if (existingCategory) {
      const error = new Error('Category Already Added!');
      throw error;
    }
    const category = await Category.create({
      name,
      userId: req.userId,
    });

    return {
      id: category.id,
      name: category.name,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  },
  createExercise: async function ({ name, categoryId }, req) {
    isAuth(req.isAuth);
    const errors = [];

    const existingExercise = await Exercise.findOne({
      where: {
        name: name,
        categoryId: categoryId,
      },
    });

    if (existingExercise) {
      const error = new Error('Exercise Already Added!');
      throw error;
    }
    const exercise = await Exercise.create({
      name,
      categoryId,
    });

    return {
      id: exercise.id,
      categoryId: exercise.categoryId,
      name: exercise.name,
      createdAt: exercise.createdAt.toISOString(),
      updatedAt: exercise.updatedAt.toISOString(),
    };
  },
  createSets: async function ({ reps, weight, exerciseId }, req) {
    isAuth(req.isAuth);
    const errors = [];

    const set = await Sets.create({
      reps,
      weight,
      exerciseId,
    });

    return {
      id: set.id,
      exerciseId: set.exerciseId,
      reps: set.reps,
      weight: set.weight,
      createdAt: set.createdAt.toISOString(),
      updatedAt: set.updatedAt.toISOString(),
    };
  },
  getCategories: async function (res, req) {
    isAuth(req.isAuth);
    const errors = [];

    const categories = await Category.findAll({
      where: {
        userId: req.userId,
      },
    });

    return {
      categories: categories.map((category) => {
        return {
          id: category.id,
          name: category.name,
          createdAt: category.createdAt.toISOString(),
          updatedAt: category.updatedAt.toISOString(),
        };
      }),
    };
  },
  getExercises: async function ({ categoryId }, req) {
    isAuth(req.isAuth);
    const errors = [];

    const exercises = await Exercise.findAll({
      where: {
        categoryId: categoryId,
      },
    });
    console.log('categories', exercises);

    return {
      exercises: exercises.map((exercise) => {
        return {
          id: exercise.id,
          name: exercise.name,
          categoryId: exercise.categoryId,
          createdAt: exercise.createdAt.toISOString(),
          updatedAt: exercise.updatedAt.toISOString(),
        };
      }),
    };
  },
  getSets: async function ({ exerciseId }, req) {
    isAuth(req.isAuth);
    const errors = [];

    const sets = await Sets.findAll({
      where: {
        exerciseId,
      },
    });

    return {
      sets: sets.map((set) => {
        return {
          id: set.id,
          exerciseId: set.exerciseId,
          reps: set.reps,
          weight: set.weight,
          createdAt: set.createdAt.toISOString(),
          updatedAt: set.updatedAt.toISOString(),
        };
      }),
    };
  },
  getAllSets: async function (res, req) {
    isAuth(req.isAuth);
    const errors = [];

    const test = await Category.findAll({
      where: { userId: req.userId },
      include: [
        {
          model: WorkoutUser,
        },
      ],
    });

    const categories = await Category.findAll({
      where: {
        userId: req.userId,
      },
    });
    let data = [];
    const exercisesData = [];

   
    let exerciseData = [];
    for (let i = 0; i < categories.length; i++) {
      let exercises = await Exercise.findAll({
        where: {
          categoryId: categories[i]?.id,
        },
      });
      if (exercises) {
        exercises.map((item) => {
          exerciseData.push(item);
        });
      }
    }
    let setData = [];
    for (let i = 0; i < exerciseData.length; i++) {
      let set = await Sets.findAll({
        where: {
          exerciseId: exerciseData[i]?.id,
        },
        include: [
          {
            model: Exercise,
            include: [Category],
          },
        ],
      });
      if (set) {
        set.map((item) => {
        //  console.log('---category----', item?.exercise?.category);
          setData.push(item);
        });
      }
    }
    // const getDataSets = async () => {
    //   categories.map(async (category) => {
    //     const exercises = await Exercise.findAll({
    //       where: {
    //         categoryId: category?.id,
    //       },
    //     });

    //     exercises.map(async (exercise) => {
    //       let set = await Sets.findAll({
    //         where: {
    //           exerciseId: exercise?.id,
    //         },
    //       });
    //       if (set) {
    //         set.map((item) => {
    //           data.push(item);
    //         });
    //       }
    //     });
    //   });
    //   return data;
    // };

    // const promises = [getAllExercises(categories)];
    // const response = await Promise.allSettled(promises);
    // console.log(response);
    // let datatest = await getDataSets();
  
    return {
      sets: setData.map((set) => {
        return {
          id: set.id,
          exerciseId: set.exerciseId,
          exercise: {
            id: set.exercise?.id,
            name: set.exercise?.name,
            category: {
              id: set?.exercise?.category.id,
              name: set?.exercise?.category.name,
              createdAt: set?.exercise?.category.createdAt.toISOString(),
              updatedAt: set?.exercise?.category.updatedAt.toISOString(),
            },
            categoryId: set.exercise?.categoryId,
            createdAt: set.exercise?.createdAt.toISOString(),
            updatedAt: set.exercise?.updatedAt.toISOString(),
          },

          reps: set.reps,
          weight: set.weight,
          createdAt: set.createdAt.toISOString(),
          updatedAt: set.updatedAt.toISOString(),
        };
      }),
    };
  },
};
