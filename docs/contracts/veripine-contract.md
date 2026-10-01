# Veripine Provider Contract — Source Verified 2026-09-28

Source: https://www.veripine.com/documentation

Base URL: `https://www.veripine.com/api`
Authentication: `x-api-key` or `Authorization: Bearer`.
All identity verification requests require `consent: true`.

Documented operations used by HambakTech:
- `POST /nin-verification`: `{nin, consent}`
- `POST /nin-phone`: `{phone, consent}`
- `POST /nin-tracking`: `{tracking_id, consent}`
- `POST /nin-demography`: `{firstname, lastname, gender, dob, consent}`
- `POST /bvn-verification`: `{bvn, consent}`
- `POST /bvn-phone`: `{phone, consent}`
- `GET /balance`
- `POST /nin-modification`: documented exact payload currently implemented is `nin_name_modification` with `nin, surname, firstname, phone_number, new_surname, new_firstname, consent`.
- `GET /nin-modification-status?reference_id=...`

The provider documentation lists phone/address modification service types but does not provide their exact request payload in the reviewed contract. HambakTech therefore does not invent browser fields or backend payloads for those operations.

Provider credentials must remain server-side. HambakTech customer prices are separate from provider starting rates and must be configured in Admin Settings.
