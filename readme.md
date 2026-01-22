<div align="left" style="position: relative;">
<img src="https://cdn-icons-png.flaticon.com/512/6295/6295417.png" align="right" width="30%" style="margin: -20px 0 0 20px;">
<h1>CHATBOT-FULLSTACK</h1>
<p align="left">
	<em><code>❯ REPLACE-ME</code></em>
</p>
<p align="left">
	<img src="https://img.shields.io/github/license/PiyushVIT346/chatbot-fullstack?style=default&logo=opensourceinitiative&logoColor=white&color=2089e8" alt="license">
	<img src="https://img.shields.io/github/last-commit/PiyushVIT346/chatbot-fullstack?style=default&logo=git&logoColor=white&color=2089e8" alt="last-commit">
	<img src="https://img.shields.io/github/languages/top/PiyushVIT346/chatbot-fullstack?style=default&color=2089e8" alt="repo-top-language">
	<img src="https://img.shields.io/github/languages/count/PiyushVIT346/chatbot-fullstack?style=default&color=2089e8" alt="repo-language-count">
</p>
<p align="left"><!-- default option, no dependency badges. -->
</p>
<p align="left">
	<!-- default option, no dependency badges. -->
</p>
</div>
<br clear="right">

##  Table of Contents

- [ Overview](#-overview)
- [ Features](#-features)
- [ Project Structure](#-project-structure)
  - [ Project Index](#-project-index)
- [ Getting Started](#-getting-started)
  - [ Prerequisites](#-prerequisites)
  - [ Installation](#-installation)
  - [ Usage](#-usage)
  - [ Testing](#-testing)
- [ Project Roadmap](#-project-roadmap)
- [ Contributing](#-contributing)
- [ License](#-license)
- [ Acknowledgments](#-acknowledgments)

---

##  Overview
This project is a robust backend API for a Chatbot Application, built with FastAPI and SQLAlchemy. It serves as the orchestration layer between a frontend interface and an AI service, managing persistent chat histories, session states, and real-time message processing.

The system is designed to handle multiple distinct chat sessions, ensuring that users can return to their previous conversations, which are organized logically by date (Today, Yesterday, etc.).

---

##  Features

# 🧠 AI-Powered Conversations
Context-Aware Messaging: The system doesn't just send the latest prompt; it retrieves and passes the relevant chat history to the ai_service to maintain conversational flow.

Automated Titling: Automatically generates a session title based on the first message sent by the user, making the history list easy to navigate.

# 📁 Advanced Session Management
Persistent Storage: Uses SQLAlchemy to store all interactions in a relational database (SQLite for local development or PostgreSQL for production).

Date-Based Grouping: An intelligent endpoint organizes chat sessions into human-readable buckets like "Today," "Yesterday," and specific dates.

CRUD Operations: Full support for creating new chats, retrieving specific session details, and deleting entire conversation histories (cascading deletes for all associated messages).

# 🛠 Technical Excellence
FastAPI Performance: Leverages the speed of FastAPI for high-concurrency message handling and automatic OpenAPI/Swagger documentation.

Flexible Database Support: Pre-configured to work seamlessly with SQLite (local) or PostgreSQL (deployment platforms like Render/Neon).

Data Validation: Uses Pydantic models to strictly enforce data types and structures for all incoming and outgoing API requests.

---

##  Project Structure

```sh
└── chatbot-fullstack/
    ├── backend
    │   ├── .env
    │   ├── __pycache__
    │   │   ├── ai_service.cpython-311.pyc
    │   │   ├── app.cpython-311.pyc
    │   │   ├── database.cpython-311.pyc
    │   │   ├── models.cpython-311.pyc
    │   │   └── schemas.cpython-311.pyc
    │   ├── ai_service.py
    │   ├── app.py
    │   ├── chatbot.db
    │   ├── database.py
    │   ├── models.py
    │   └── requirements.txt
    ├── desktop.ini
    ├── frontend
    │   ├── .env
    │   ├── .gitignore
    │   ├── README.md
    │   ├── package-lock.json
    │   ├── package.json
    │   ├── public
    │   │   ├── favicon.ico
    │   │   ├── index.html
    │   │   ├── logo192.png
    │   │   ├── logo512.png
    │   │   ├── manifest.json
    │   │   └── robots.txt
    │   └── src
    │       ├── App.css
    │       ├── App.js
    │       ├── App.test.js
    │       ├── index.css
    │       ├── index.js
    │       ├── logo.svg
    │       ├── reportWebVitals.js
    │       └── setupTests.js
    └── requirements.txt
```


###  Project Index
<details open>
	<summary><b><code>CHATBOT-FULLSTACK/</code></b></summary>
	<details> <!-- __root__ Submodule -->
		<summary><b>__root__</b></summary>
		<blockquote>
			<table>
			<tr>
				<td><b><a href='https://github.com/PiyushVIT346/chatbot-fullstack/blob/master/desktop.ini'>desktop.ini</a></b></td>
				<td><code>❯ REPLACE-ME</code></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/PiyushVIT346/chatbot-fullstack/blob/master/requirements.txt'>requirements.txt</a></b></td>
				<td><code>❯ REPLACE-ME</code></td>
			</tr>
			</table>
		</blockquote>
	</details>
	<details> <!-- backend Submodule -->
		<summary><b>backend</b></summary>
		<blockquote>
			<table>
			<tr>
				<td><b><a href='https://github.com/PiyushVIT346/chatbot-fullstack/blob/master/backend/ai_service.py'>ai_service.py</a></b></td>
				<td><code>❯ REPLACE-ME</code></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/PiyushVIT346/chatbot-fullstack/blob/master/backend/database.py'>database.py</a></b></td>
				<td><code>❯ REPLACE-ME</code></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/PiyushVIT346/chatbot-fullstack/blob/master/backend/app.py'>app.py</a></b></td>
				<td><code>❯ REPLACE-ME</code></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/PiyushVIT346/chatbot-fullstack/blob/master/backend/.env'>.env</a></b></td>
				<td><code>❯ REPLACE-ME</code></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/PiyushVIT346/chatbot-fullstack/blob/master/backend/requirements.txt'>requirements.txt</a></b></td>
				<td><code>❯ REPLACE-ME</code></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/PiyushVIT346/chatbot-fullstack/blob/master/backend/models.py'>models.py</a></b></td>
				<td><code>❯ REPLACE-ME</code></td>
			</tr>
			</table>
		</blockquote>
	</details>
	<details> <!-- frontend Submodule -->
		<summary><b>frontend</b></summary>
		<blockquote>
			<table>
			<tr>
				<td><b><a href='https://github.com/PiyushVIT346/chatbot-fullstack/blob/master/frontend/package-lock.json'>package-lock.json</a></b></td>
				<td><code>❯ REPLACE-ME</code></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/PiyushVIT346/chatbot-fullstack/blob/master/frontend/.env'>.env</a></b></td>
				<td><code>❯ REPLACE-ME</code></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/PiyushVIT346/chatbot-fullstack/blob/master/frontend/package.json'>package.json</a></b></td>
				<td><code>❯ REPLACE-ME</code></td>
			</tr>
			</table>
			<details>
				<summary><b>src</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/PiyushVIT346/chatbot-fullstack/blob/master/frontend/src/index.css'>index.css</a></b></td>
						<td><code>❯ REPLACE-ME</code></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/PiyushVIT346/chatbot-fullstack/blob/master/frontend/src/App.css'>App.css</a></b></td>
						<td><code>❯ REPLACE-ME</code></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/PiyushVIT346/chatbot-fullstack/blob/master/frontend/src/App.test.js'>App.test.js</a></b></td>
						<td><code>❯ REPLACE-ME</code></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/PiyushVIT346/chatbot-fullstack/blob/master/frontend/src/setupTests.js'>setupTests.js</a></b></td>
						<td><code>❯ REPLACE-ME</code></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/PiyushVIT346/chatbot-fullstack/blob/master/frontend/src/App.js'>App.js</a></b></td>
						<td><code>❯ REPLACE-ME</code></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/PiyushVIT346/chatbot-fullstack/blob/master/frontend/src/reportWebVitals.js'>reportWebVitals.js</a></b></td>
						<td><code>❯ REPLACE-ME</code></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/PiyushVIT346/chatbot-fullstack/blob/master/frontend/src/index.js'>index.js</a></b></td>
						<td><code>❯ REPLACE-ME</code></td>
					</tr>
					</table>
				</blockquote>
			</details>
			<details>
				<summary><b>public</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/PiyushVIT346/chatbot-fullstack/blob/master/frontend/public/index.html'>index.html</a></b></td>
						<td><code>❯ REPLACE-ME</code></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/PiyushVIT346/chatbot-fullstack/blob/master/frontend/public/manifest.json'>manifest.json</a></b></td>
						<td><code>❯ REPLACE-ME</code></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/PiyushVIT346/chatbot-fullstack/blob/master/frontend/public/robots.txt'>robots.txt</a></b></td>
						<td><code>❯ REPLACE-ME</code></td>
					</tr>
					</table>
				</blockquote>
			</details>
		</blockquote>
	</details>
</details>

---
##  Getting Started

###  Prerequisites

Before getting started with chatbot-fullstack, ensure your runtime environment meets the following requirements:

- **Programming Language:** JavaScript
- **Package Manager:** Pip, Npm
- **Container Runtime:** Docker


###  Installation

Install chatbot-fullstack using one of the following methods:

**Build from source:**

1. Clone the chatbot-fullstack repository:
```sh
❯ git clone https://github.com/PiyushVIT346/chatbot-fullstack
```

2. Navigate to the project directory:
```sh
❯ cd chatbot-fullstack
```

3. Install the project dependencies:


**Using `pip`** &nbsp; [<img align="center" src="" />]()

```sh
❯ echo 'INSERT-INSTALL-COMMAND-HERE'
```


**Using `npm`** &nbsp; [<img align="center" src="https://img.shields.io/badge/npm-CB3837.svg?style={badge_style}&logo=npm&logoColor=white" />](https://www.npmjs.com/)

```sh
❯ npm install
```


**Using `docker`** &nbsp; [<img align="center" src="https://img.shields.io/badge/Docker-2CA5E0.svg?style={badge_style}&logo=docker&logoColor=white" />](https://www.docker.com/)

```sh
❯ docker build -t PiyushVIT346/chatbot-fullstack .
```




###  Usage
Run chatbot-fullstack using the following command:
**Using `pip`** &nbsp; [<img align="center" src="" />]()

```sh
❯ echo 'INSERT-RUN-COMMAND-HERE'
```


**Using `npm`** &nbsp; [<img align="center" src="https://img.shields.io/badge/npm-CB3837.svg?style={badge_style}&logo=npm&logoColor=white" />](https://www.npmjs.com/)

```sh
❯ npm start
```


**Using `docker`** &nbsp; [<img align="center" src="https://img.shields.io/badge/Docker-2CA5E0.svg?style={badge_style}&logo=docker&logoColor=white" />](https://www.docker.com/)

```sh
❯ docker run -it {image_name}
```


###  Testing
Run the test suite using the following command:
**Using `pip`** &nbsp; [<img align="center" src="" />]()

```sh
❯ echo 'INSERT-TEST-COMMAND-HERE'
```


**Using `npm`** &nbsp; [<img align="center" src="https://img.shields.io/badge/npm-CB3837.svg?style={badge_style}&logo=npm&logoColor=white" />](https://www.npmjs.com/)

```sh
❯ npm test
```


---
