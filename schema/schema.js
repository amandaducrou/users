const graphql = require("graphql");
const axios = require("axios");

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLList,
    GraphQLSchema
} = graphql;

// Collections on Server
const companies = "companies", users = "users";

const _getFromServer = (path) => {
    return axios.get(`http://localhost:3000/${path}`)
                    .then(response => response.data);
};

const CompanyType = new GraphQLObjectType({
    name: "Company",
    fields: () => ({
        id: {type: GraphQLString},
        name: {type: GraphQLString},
        description: {type: GraphQLString},
        users: {
            type: new GraphQLList(UserType),
            resolve(parentValue, args) {
                return _getFromServer(`${companies}/${parentValue.id}/${users}`);
            }
        }
    })
});

const UserType = new GraphQLObjectType({
    name: "User",
    fields: () => ({
        id: {type: GraphQLString},
        firstName: {type: GraphQLString},
        age: {type: GraphQLInt},
        company: {
            type: CompanyType,
            resolve(parentValue, args) {
                return _getFromServer(`${companies}/${parentValue.companyId}`);
            }
        }
    })
});

const RootQueryType = new GraphQLObjectType({
    name: "RootQuery",
    fields: {
        user: {
            type: UserType,
            args: {
                id: {type: GraphQLString}
            },
            resolve(parentValue, args) {
                return _getFromServer(`${users}/${args.id}`);
            }
        },
        company: {
            type: CompanyType,
            args: {
                id: {type: GraphQLString}
            },
            resolve(parentValue, args) {
                return _getFromServer(`${companies}/${args.id}`);
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQueryType
});
