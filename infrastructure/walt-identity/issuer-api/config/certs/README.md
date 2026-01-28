# Demo issuer certificate (P-256)

This folder contains a demo EC P-256 issuer certificate chain (root + leaf) for
SD-JWT VC issuance with an x5c header. Inji currently verifies SD-JWT VC only
when the public key is provided as an X.509 certificate in the header.

## Files

- issuer-ec256.key: EC private key (P-256)
- issuer-ec256.crt: leaf certificate (PEM), signed by the demo root CA
- issuer-ec256.der: leaf certificate in DER format
- issuer-ec256.x5c.txt: leaf cert base64 DER (single-line)
- issuer-ec256.jwk.json: JWK representation of the private key
- issuer-root-ec256.key: root CA private key (P-256)
- issuer-root-ec256.crt: root CA certificate (PEM)
- issuer-root-ec256.der: root CA certificate in DER format
- issuer-root-ec256.x5c.txt: root cert base64 DER (single-line)

## How the keys were made

1. Generate EC private keys (P-256):

```bash
openssl ecparam -genkey -name prime256v1 -noout -out issuer-ec256.key
openssl ecparam -genkey -name prime256v1 -noout -out issuer-root-ec256.key
```

2. Create a root CA certificate for demo use:

```bash
openssl req -new -x509 -key issuer-root-ec256.key -out issuer-root-ec256.crt -days 3650 -subj "/CN=vc-demo.opencrvs.dev Root CA" -addext "basicConstraints=critical,CA:TRUE" -addext "keyUsage=critical,keyCertSign,cRLSign"
```

3. Create a leaf certificate signed by the root CA:

```bash
openssl req -new -key issuer-ec256.key -out issuer-ec256.csr -subj "/CN=vc-demo.opencrvs.dev"
openssl x509 -req -in issuer-ec256.csr -CA issuer-root-ec256.crt -CAkey issuer-root-ec256.key -CAcreateserial -out issuer-ec256.crt -days 3650 -extfile <(printf "basicConstraints=CA:FALSE\nkeyUsage=critical,digitalSignature\nextendedKeyUsage=clientAuth,serverAuth")
```

4. Convert to DER and base64 for x5c:

```bash
openssl x509 -in issuer-ec256.crt -outform DER -out issuer-ec256.der
base64 -w 0 issuer-ec256.der > issuer-ec256.x5c.txt
openssl x509 -in issuer-root-ec256.crt -outform DER -out issuer-root-ec256.der
base64 -w 0 issuer-root-ec256.der > issuer-root-ec256.x5c.txt
```

5. Export a JWK from the EC private key:

```bash
node -e "const {readFileSync} = require('fs'); const {createPrivateKey, createHash} = require('crypto'); const pem = readFileSync('issuer-ec256.key','utf8'); const key = createPrivateKey(pem); const jwk = key.export({format:'jwk'}); const thumb = JSON.stringify({crv:jwk.crv, kty:jwk.kty, x:jwk.x, y:jwk.y}); jwk.use='sig'; jwk.alg='ES256'; jwk.kid=createHash('sha256').update(thumb).digest('base64url'); console.log(JSON.stringify({type:'jwk',jwk}, null, 2));"
```

## Why this exists

Some verifiers (e.g., Inji) currently require SD-JWT VC signing keys to be
embedded as X.509 certificates in the JOSE header (x5c). Walt.id expects x5c
input as PEM in the issuance request and converts it to base64 DER internally.
This demo root + leaf chain is used to generate a valid x5c header for testing
and demos.

## Important

- This is demo-only. Do not use these keys in production.
- Rotate the keypair if you regenerate the certificate.
