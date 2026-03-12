const database = {
  users: [
    {
      id: "1",
      name: "Ali",
      email: "Ali@example.com",
      password: "1232",
      wallet: {
        balance: 12457,
        currency: "MAD",
        cards: [
          { id: "c1", numcards: "124847", type: "visa", balance: "14712", expiry: "14-08-27", vcc: "147" },
          { id: "c2", numcards: "124478", type: "mastercard", balance: "1470", expiry: "14-08-28", vcc: "257" }
        ],
        transactions: [
          { id: "1", type: "credit", amount: 140, date: "14-08-25", from: "Ahmed", to: "124847" },
          { id: "2", type: "debit", amount: 200, date: "13-08-25", from: "124847", to: "Amazon" }
        ]
      }
    },
    {
      id: "2",
      name: "Ahmed",
      email: "Ahmed@example.com",
      password: "1234",
      wallet: {
        balance: 8000,
        currency: "MAD",
        cards: [
          { id: "c3", numcards: "999111", type: "visa", balance: "8000", expiry: "01-09-27", vcc: "321" }
        ],
        transactions: []
      }
    },
    {
      id: "3",
      name: "Fatima",
      email: "fatima@example.com",
      password: "1111",
      wallet: {
        balance: 5000,
        currency: "MAD",
        cards: [
          { id: "c4", numcards: "777888", type: "visa", balance: "5000", expiry: "02-07-27", vcc: "111" }
        ],
        transactions: []
      }
    },
    {
      id: "4",
      name: "Youssef",
      email: "youssef@example.com",
      password: "2222",
      wallet: {
        balance: 9000,
        currency: "MAD",
        cards: [
          { id: "c5", numcards: "555444", type: "mastercard", balance: "9000", expiry: "05-06-27", vcc: "222" }
        ],
        transactions: []
      }
    }
  ]
};

export const finduserbymail = (mail, password) => {
  return database.users.find(u => u.email === mail && u.password === password);
};

export default database;