const dotenv = require("dotenv");
dotenv.config();
dotenv.config({ path: `.env.local`, override: true });

const express = require("express");
const axios = require("axios");

const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());

app.post("/validate", async (req, res) => {
	let azauth;
	try {
		azauth = await axios.post(process.env.AZAUTH_HOST + "/api/auth/verify", {
			access_token: req.body.accessToken,
		});
	} catch (error) {
		res.status(403).send(error.response.data);
		return;
	}
	res.status(204).send();
});

app.post("/authenticate", async (req, res) => {
	let azauth;
	try {
		azauth = await axios.post(process.env.AZAUTH_HOST + "/api/auth/authenticate", {
			email: req.body.username,
			password: req.body.password,
			code: req.body.code,
		});
	} catch (error) {
		res.status(401).send(error.response.data);
		return;
	}

	const profile = { name: azauth.data.username, id: azauth.data.id };

	const mojangResponse = {
		clientToken: req.body.clientToken,
		accessToken: azauth.data.access_token,
		availableProfiles: [profile],
		selectedProfile: profile,
	};

	if (req.body.requestUser) {
		const user = {
			username: azauth.data.username,
			id: azauth.data.id,
			properties: [
				{
					name: "preferredLanguage",
					value: "hu-HU",
				},
				{
					name: "registrationCountry",
					value: "HU",
				},
			],
		};
		mojangResponse.user = user;
	}

	res.status(200).send(mojangResponse);
});

app.post("/refresh", async (req, res) => {
	// TODO
});

app.post("/signout", async (req, res) => {
	// TODO
});

app.post("/invalidate", async (req, res) => {
	let azauth;
	try {
		azauth = await axios.post(process.env.AZAUTH_HOST + "/api/auth/logout", {
			access_token: req.body.accessToken,
		});
	} catch (error) {
		res.status(500).send(error.response.data);
	}
	res.status(200).send();
});

app.listen(port, () => {
	console.log(`AzAuth proxy listening on port ${port}`);
});
