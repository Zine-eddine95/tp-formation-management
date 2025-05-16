const express = require("express");
const router = express.Router();

// Simulate fund requests database
const fundRequests = [
  {
    id: 1,
    requestDate: "2025-02-25",
    projectId: 3,
    projectName: "Formation Cybersécurité",
    clientId: 1,
    clientName: "TF1",
    amount: 5000,
    justification: "Ajout de modules supplémentaires",
    status: "pending", // pending, approved, rejected
  },
  {
    id: 2,
    requestDate: "2025-02-20",
    projectId: 1,
    projectName: "Formation Dev Web",
    clientId: 1,
    clientName: "TF1",
    amount: 3000,
    justification: "Extension de la durée de formation",
    status: "approved",
  },
  {
    id: 3,
    requestDate: "2025-02-15",
    projectId: 2,
    projectName: "Formation Management",
    clientId: 2,
    clientName: "Bouygues",
    amount: 7500,
    justification: "Nouveaux participants",
    status: "rejected",
  },
];

// Get all fund requests
router.get("/", (req, res) => {
  // Convert dates to formatted strings (DD/MM/YYYY)
  const formattedRequests = fundRequests.map((request) => {
    const date = new Date(request.requestDate);
    const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;

    return {
      ...request,
      formattedDate,
    };
  });

  res.json(formattedRequests);
});

// Add a new fund request
router.post("/add", (req, res) => {
  const {
    projectId,
    projectName,
    clientId,
    clientName,
    amount,
    justification,
  } = req.body;

  // Current date in ISO format (YYYY-MM-DD)
  const today = new Date();
  const isoDate = today.toISOString().split("T")[0];

  const newRequest = {
    id: fundRequests.length + 1,
    requestDate: isoDate,
    projectId: parseInt(projectId),
    projectName,
    clientId: parseInt(clientId),
    clientName,
    amount: parseFloat(amount),
    justification,
    status: "pending",
  };

  fundRequests.push(newRequest);

  // Format the date for response
  const formattedDate = `${today.getDate().toString().padStart(2, "0")}/${(
    today.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}/${today.getFullYear()}`;

  const responseData = {
    ...newRequest,
    formattedDate,
  };

  res.status(201).json(responseData);
});

// Update fund request status
router.put("/:id/status", (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;

  // Check if status is valid
  if (!["pending", "approved", "rejected"].includes(status)) {
    return res.status(400).send("Invalid status value");
  }

  const requestIndex = fundRequests.findIndex((request) => request.id === id);
  if (requestIndex === -1) {
    return res.status(404).send("Fund request not found");
  }

  fundRequests[requestIndex].status = status;

  // If the request is approved, we might want to update the project budget
  // This would involve calling a method from the projects service

  res.json(fundRequests[requestIndex]);
});

// Get fund requests by status
router.get("/status/:status", (req, res) => {
  const status = req.params.status;

  // Check if status is valid
  if (!["pending", "approved", "rejected", "all"].includes(status)) {
    return res.status(400).send("Invalid status value");
  }

  // Filter requests by status (if 'all', return all requests)
  const filteredRequests =
    status === "all"
      ? fundRequests
      : fundRequests.filter((request) => request.status === status);

  // Format dates
  const formattedRequests = filteredRequests.map((request) => {
    const date = new Date(request.requestDate);
    const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;

    return {
      ...request,
      formattedDate,
    };
  });

  res.json(formattedRequests);
});

module.exports = router;
