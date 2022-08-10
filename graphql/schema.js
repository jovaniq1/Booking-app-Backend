const { buildSchema } = require('graphql');

module.exports = buildSchema(`

    type Post {
        _id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
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
        login(username: String!, password: String!): AuthData!
        greet: ExampleResponse
        portfolio: ExampleResponse
        userInfo: User!
        getCustomers: CustomersData!
        appointments(page: Int, websiteId:ID): AppointmentData!
        appointment(id:ID!): Appointment!
        getWebsite(domain: String!): GetWebsiteData!
    }
    type RootMutation {
        createUser(userInput: UserInputData): AuthData!
        createWebsite(userInput: NewWebsiteData): CreateWebsiteResponse!
        createService(userInput: NewServiceData): Service!
        createAppointment(AppointmentInput: AppointmentInputData): Appointment!
        updateAppointment(id: ID!, AppointmentInput: AppointmentInputData): Appointment!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);
