const { buildSchema } = require('graphql');

module.exports = buildSchema(`



    type WorkoutUser {
        id: Int!
        email: String!
        firstname: String
        lastname: String
        password: String
        createdAt: String
        updatedAt: String
    }
    type Category {
        id: Int!
        userId: Int!
        name: String!
        createdAt: String
        updatedAt: String
    }
    type Set {
        id: Int!
        reps: Int!
        weight: String!
        exerciseId: Int!
        createdAt: String
        updatedAt: String
    }
   
    type Exercise {
        id: Int!
        categoryId: Int!
        name: String
        createdAt: String
        updatedAt: String
    }
    type AllExercise {
        id: Int!
        categoryId: Int!
        category:Category
        name: String
        createdAt: String
        updatedAt: String
    }
    type AllSets {
        id: Int!
        reps: Int!
        weight: String!
        exercise: AllExercise
        createdAt: String
        updatedAt: String
    }
    type AllSetsData{
        sets: [AllSets]
    }
    
   
    type WorkoutAuthData {
        token: String!
        userInfo: WorkoutUser!
    }
    type GetCategories{
        categories:[Category]
    }
    type GetExercises{
        exercises:[Exercise]
    }
    type GetSets{
        sets:[Set]
    }

    type User {
        _id: ID!
        username: String!
        email: String!
        firstname: String!
        lastname: String!
        password: String!
        phone: String!
        role: String
        date: String
        appointments: [Appointment!]!
    }
    type Staff {
        _id: ID!
        offerServices: [Service]
        website: ID!
        schedule: String
        currentAppointments: [Appointment]
    }
    type Appointment {
        _id: ID!
        creator: User!
        customer: User!
        staff: User!
        status: String
        service: Service!
        completed: Boolean!
        start: String!
        end: String!
        dateCreated: String
    }
    type Website {
        _id: ID!
        admin:User
        name: String
        domain: String
        staff: User
        customer: User
        schedule: [String]
        visits: Int
        imageUrl:[String]
        lastVisit: String
        plan: String
        dateCreated: String
    }
    type Service {
        _id: ID!
        websiteId: Website
        serviceName: String
        staff: User!
        duration: Int
        cost: Float
        description: String
        dateCreated: String
    }
    input AppointmentInputData {
        website: ID
        customer: ID
        staff: ID
        service: ID
        status: String
        Completed: Boolean
        start: String
        end: String
    }
    type AppointmentData {
        appointments: [Appointment!]!
        totalAppointments: Int!
    }
    type GetWebsiteData {
        website: Website!
        customers: [User]
        staff: [User]
        services: [Service]
    }
    type CustomersData {
        customers: [User!]!
        staff: [User!]!
        totalCustomers: Int!
        totalStaff: Int!
    }

    type AuthData {
        token: String!
        userId: String!
        webId: String!
        userInfo: User!
    }

    type ExampleResponse {
        name: String
        message: String
      }

    input UserInputData {
        website: String
        username: String!
        email: String!
        firstname: String!
        lastname: String!
        password: String!
        phone: String!
        role: String
    }
    input UserInputDataWorkout {
        email: String!
        firstname: String!
        lastname: String!
        password: String!
      
    }
    input NewService {
        serviceName: String!
        description: String!
        cost: Int!
      }
    input NewWebsiteData {
        name: String!
        domain: String!
        schedule: [String]
        visits: Int
        imageUrl: String
        lastVisit: String
        dateCreated: String
      }
    input NewServiceData {
        name: String!
        website: ID
        description: String
        cost: Int
        duration: Int
      }

    input PostInputData {
        title: String!
        content: String!
        imageUrl: String!
    }

    type CreateWebsiteResponse {
        name: String
      }

      type AppointmentResponse {
        appointmentId: String
      }

    type RootQuery {
        workoutLogin(email: String!, password: String!): WorkoutAuthData!
        getCategories: GetCategories!
        getExercises(categoryId: ID!): GetExercises!
        getSets(exerciseId: ID!): GetSets!
        getAllSets: AllSetsData!
        login(username: String!, password: String!): AuthData!
        greet: ExampleResponse
        portfolio: ExampleResponse
        userInfo: User!
        getCustomers: CustomersData!
        appointments(page: Int): AppointmentData!
        appointment(id:ID!): Appointment!
        getWebsite(domain: String): GetWebsiteData!
    }
    type RootMutation {
        createWorkoutUser(userInput: UserInputDataWorkout): WorkoutAuthData!
        createCategory(name: String!): Category!
        createExercise(name: String!, categoryId: ID!): Exercise!
        createSets(reps: String!,weight: String!, exerciseId: ID!): Set!
        createUser(userInput: UserInputData): AuthData!
        createWebsite(userInput: NewWebsiteData): CreateWebsiteResponse!
        createService(userInput: NewServiceData): Service!
        createAppointment(AppointmentInput: AppointmentInputData): Appointment!
        updateAppointment(id: ID!, AppointmentInput: AppointmentInputData): Appointment!
        updateStaff(offerServices: ID, schedule: String): Staff!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);
