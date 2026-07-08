# NEVERMORE-EU/Global scale 
NEVERMORE-EU/Global scale - repository

The EU/Global Scale Tool is a web-based decision-support application developed within the NEVERMORE context to support the creation, management, simulation and comparison of policy scenarios at global and European scale. The repository is organised into two main application layers: an Angular frontend and a FastAPI backend.

The tool allows users to define scenarios, configure policy variables, launch model calculations through an external simulation service, visualise results, compare scenarios and exchange messages through a chat module. Authentication and user/session handling are integrated with Keycloak, while scenario and chat data are managed through the backend API.

## Repository structure

```text
.
├── frontend/                  # Angular web application
└── backend/
    ├── docker-compose.yml     # Backend and Redis deployment configuration
    └── nevermore_api/         # FastAPI backend service
```

## Frontend

The `frontend/` folder contains the Angular application used as the graphical user interface of the tool.

The frontend provides:

- A welcome page and user guide access.
- Scenario management views.
- Forms and controls for policy parametrisation.
- Scenario execution through the external simulation API.
- Visualisation of model outputs using Plotly charts.
- Scenario comparison views.
- Chat interface connected to the backend API and WebSocket service.
- Token-based request handling through an HTTP interceptor.

### Key technologies

- Angular 18
- TypeScript
- RxJS
- NG-ZORRO Ant Design
- Plotly / angular-plotly.js
- ng2-pdf-viewer
- Nginx for containerised deployment

## Backend

The `backend/nevermore_api/` folder contains the FastAPI backend service.

The backend provides:

- REST endpoints for scenario creation, retrieval, update and deletion.
- REST endpoint for saving policy configurations linked to scenarios.
- REST endpoints for chat message storage and retrieval.
- WebSocket endpoint for real-time chat updates.
- Authentication and token validation through Keycloak.
- PostgreSQL database access through SQLAlchemy.
- Redis-based broadcasting for WebSocket communication.
- CORS and GZip middleware configuration.

### Key technologies

- Python 3.12
- FastAPI
- Uvicorn / Gunicorn
- SQLAlchemy
- PostgreSQL
- Redis
- Broadcaster
- python-keycloak
- Poetry
- Pytest

## License

This software is released under the MIT License 2026.

This repository includes software developed in the context of a Horizon Europe project. The use, modification and distribution of the software are subject to the terms of the Apache License 2.0 and to any applicable provisions defined in the project Grant Agreement and Consortium Agreement.

## Contributors

Developed by Fundación CARTIF.
