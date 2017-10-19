{"scene": {
  "map": "basicRoom.jpg",
  "first-frame": "001",
  "frames": [
    
    {
      "id": "001",
      "text": "You are in a red room with two doors.",
      "options": [
        {
          "id": "1",
          "text": "Go North",
          "next": "002",
          "remove": False
        },
        {
          "id": "2",
          "text": "Go East",
          "next": "004",
          "remove": False
        }
      ]
    },
    
    {
      "id": "002",
      "text": "You are in a blue room with two doors.",
      "options": [
        {
          "id": "1",
          "text": "Go South",
          "next": "001",
          "remove": False
        },
        {
          "id": "2",
          "text": "Go East",
          "next": "003",
          "remove": False
        }
      ]
    },
    
    {
      "id": "003",
      "text": "You are in a yellow room with two doors.",
      "options": [
        {
          "id": "1",
          "text": "Go West",
          "next": "002",
          "remove": False
        },
        {
          "id": "2",
          "text": "Go South",
          "next": "004",
          "remove": False
        }
      ]
    },
    
    {
      "id": "004",
      "text": "You are in a green room with three doors.",
      "options": [
        {
          "id": "1",
          "text": "Go North",
          "next": "003",
          "remove": False
        },
        {
          "id": "2",
          "text": "Go West",
          "next": "001",
          "remove": False
        },
        {
          "id": "3",
          "text": "Go East",
          "next": "005",
          "remove": False
        }
      ]
    },
    
    {
      "id": "005",
      "text": "You are in a black room with two doors.",
      "options": [
        {
          "id": "1",
          "text": "Go West",
          "next": "004",
          "remove": False
        },
        {
          "id": "2",
          "text": "Go East",
          "next": "006",
          "remove": False
        }
      ]
    },
    
    
    {
      "id": "006",
      "text": "Congratlations, you escaped the building!",
      "options": []
    }
    
  ]
}}
