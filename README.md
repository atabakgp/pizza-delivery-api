# Pizza delivery - APP

Features:
- Users can register,login,and logout
- payments with the [Stripe API](https://stripe.com/docs/api)
- notifications by email with [Mailgun API](https://documentation.mailgun.com/en/latest/api_reference.html)
- No [NPM](https://docs.npmjs.com/about-npm/) or third-party dependencies
## Routes 
#### USERS
| Route | Method | Required Data | Optional Data | Description |
|--|--|--|--|--|
| /api/users | GET | **queryString**: email **headers**: token | none | Only let an authenticated user access their object, don't let them access anyone else |
| /api/users | POST | **body**: firstname,lastname, email, street address, and password.| none | Creates a new user |
| /api/user | PUT | **queryString**: email **headers**: token | **body**: firstname, lastname, address, and password. | Update the specific user|
| /api/user | DELETE | **queryString**: email **headers**: token | none | Delete the specific user|


#### Auth
| Route | Method | Required Data | Optional Data | Description |
|--|--|--|--|--|
| /api/token | POST | **body**: email, password | none | Login |
| /api/token | GET | **queryString**: id | none | Get the specific token |
| /api/token | PUT | **Body**: id, extend | none | Update the specific token |
| /api/token | DELETE | **queryString**: id  | none | Logout |




#### Orders
| Route | Method | Required Data | Optional Data | Description |
|--|--|--|--|--|
| /api/menu | GET | **queryString**: email | none | Get the menu |
| /api/cart | POST | **queryString**: email **header**: token **body**: pizza id, size, count | none | Post the order and update it|
| /api/checkout | POST | **queryString**: email **header**: token | none | Payment and send email |


- Config required
  ```text
  STRIPE_PK=YOUR_STRIPE_PUBLIC_KEY
  STRIPE_SK=YOUR_STRIPE_SECRET_KEY
  MAILGUN_DOMAIN=YOUR_MAILGUN_DOMAIN
  MAILGUN_API_KEY=YOUR_MAILGUN_API_KEY

- Run the project:
  ```console
  $ cd pizza-delivery-api
  $ node index.js
  ```

- Order Object:
```console
'1': {
  'id': string,
  'size': string
  'count' number
},
'2': {
  'id': string,
  'size': string
  'count' number
},
...
```