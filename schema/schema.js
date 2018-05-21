const graphql = require("graphql");
const axios = require("axios");

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
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

const MutationType = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        addUser: {
            type: UserType,
            args: {
                firstName: {type: new GraphQLNonNull(GraphQLString)},
                age: {type: new GraphQLNonNull(GraphQLInt)},
                companyId: {type: GraphQLString}
            },
            resolve(parentValue, {firstName, age}) {
                return axios.post(`http://localhost:3000/${users}`, {firstName, age})
                    .then(response => response.data);
            }
        },
        deleteUser: {
            type: UserType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve(parentValue, {id}) {
                return axios.delete(`http://localhost:3000/${users}/${id}`)
                    .then(response => response.data);
            }
        },
        editUser: {
            type: UserType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLString)},
                firstName: {type: GraphQLString},
                age: {type: GraphQLInt},
                companyId: {type: GraphQLString}
            },
            resolve(parentValue, args) {
                return axios.patch(`http://localhost:3000/${users}/${args.id}`, args)
                    .then(response => response.data);
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQueryType,
    mutation: MutationType
});
