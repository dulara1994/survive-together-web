import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { WebSocketLink } from "apollo-link-ws";
import { ApolloLink } from "apollo-link";
import { getMainDefinition } from "apollo-utilities";
import { InMemoryCache } from "apollo-cache-inmemory";
import { onError } from "apollo-link-error";
import { GRAPHQL_ENDPOINT, GRAPHQL_WS_ENDPOINT } from "../config";

// Create an http link:
const httpLink = new HttpLink({
  uri: GRAPHQL_ENDPOINT,
});

// Create a WebSocket link:
const wsLink = new WebSocketLink({
  uri: GRAPHQL_WS_ENDPOINT as string,
  options: {
    reconnect: true,
  },
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors)
        graphQLErrors.forEach(({ message, locations, path }) =>
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
          )
        );
      if (networkError) console.log(`[Network error]: ${networkError}`);
    }),
    ApolloLink.split(
      // split based on operation type
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === "OperationDefinition" &&
          definition.operation === "subscription"
        );
      },
      wsLink,
      httpLink
    ),
  ]),
  cache: new InMemoryCache(),
});
