# The FinSpec Specification Validator

## How to use 

The FinSpec validator is a tool designed to validate that FinSpec JSON documents correctly match the specification as defined, or to return error messages indicating where the validation is failing.

    curl -XPOST localhost:8080/validate -F json=@/path/to/finspec.json