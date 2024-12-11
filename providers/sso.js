const { Provider } = require("oidc-provider");
require("dotenv").config();

const oidcConfig = {
    clients: [
        {
            client_id: "client_id_example",
            client_secret: "client_secret_example",
            redirect_uris: ["http://localhost:3000/callback"],
        },
    ],
    features: {
        introspection: true,
        revocation: true,
    },
};

const oidc = new Provider("http://localhost:3000", oidcConfig);

oidc.listen(process.env.PORT || 3000, () => {
    console.log("OIDC Provider running on port 3000");
});

module.exports = oidc;
