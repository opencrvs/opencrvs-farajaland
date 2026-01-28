curl -X POST "https://vc-demo.opencrvs.dev:7004/verification-session/create" \
  -H "Content-Type: application/json" \
  -d '{
    "flow_type": "cross_device",
    "core_flow": {
      "dcql_query": {
        "credentials": [
          {
            "id": "birth_sdjwt",
            "format": "dc+sd-jwt",
            "meta": {
              "vct_values": ["crvs_birth_v1"]
            },
            "claims": [
              { "path": ["given_name"] },
              { "path": ["family_name"] },
              { "path": ["birthdate"] },
              { "path": ["place_of_birth"] }
            ]
          }
        ]
      },
      "signed_request": true,
      "clientId": "x509_san_dns:vc-demo.opencrvs.dev",
      "key": {"type":"jwk","jwk":{"kty":"EC","d":"u0-cviQ-QOqCHhduzPieP1kZQ_jI_VL7_lwa_37quKc","crv":"P-256","kid":"lMFMDHG2Nf79zbHwn8HYzY9pYOwpRaKnSnUD9qAf5-Q","x":"tZyzvd8Vz7trswAnyIfk1aR8teGnD13cn4MLMiEFhEA","y":"zMMUkryfUI2Dv-xW1WslYTBDMCqJmjIyaSBuRTcgeJU"}}
    }
  }'