
# Okanjo Javascript SDK Change Log

When stuff changes, it's described here.

## 2015-03-

## 2015-01-14
 * Added interactive console for working with the API in node
 * Bumped version to 0.1.24

## 2014-12-31
 * Added store flags for tax and shipping
 * Added shipping transaction types
 * Added checkout rates route
 * Bumped version to 0.1.23

## 2014-12-08
 * Added nexus AddressType
 * Added productCategoryRelationshipType
 * Added transaction types for sales tax
 * Added userFlag constants
 * Added store address management routes
 * Fixed incorrect routes in user address management routes
 * Bumped version to 0.1.22

## 2014-11-07
 * Added event routes for webhooks
 * Added event constants
 * Added webhook listener examples
 * Bumped version to 0.1.21

## 2014-10-22
 * Bumped version to 0.1.19
 * Added POST /stores route to add a new store
 * Added DELETE /stores/{id} route to disable an existing store
 * Added category tree route
 * Added user card routes

## 2014-08-25
 * Adjusted minimum item and purchase limits to $0.01 and $0.50, respectively.
 * Bumped version to 0.1.17

## 2014-08-18
 * Fixed a bug with getProductById using the incorrect route
 * Fixed a bug with HttpProvider.stream failed to execute requests without an entity body (GETs)
 * Bumped version to 0.1.16

## 2014-08-07
 * Added order status for pending disputes
 * Added order item dispute route
 * Bumped version to 0.1.14

## 2014-08-06
 * Added order status for pending refunds
 * Added sale refund route
 * Bumped version to 0.1.13

## 2014-07-03
 * Cleaned up a straggling error log
 * Bumped version to 0.1.11

## 2014-07-02
 * Added option to use jQuery's $.param function for object serialization instead of the default qs module
 * Bumped version to 0.1.10

## 2014-06-25
 * Added transaction constants
 * Added transaction routes for stores and users
 * Bumped version to 0.1.8

## 2014-05-28
 * Added serialize function to okanjo namespace
 * Added SDK constants to okanjo namespace
 * Added jQuery-based serialization function (aka $.params) with modifications, which can be used for product variants
 * Updated FileUpload helper to use Buffers instead of binary strings and getEntityBody returns a buffer with the binary content
 * Refactored the HTTP provider stream function to handle the entity buffer generation as a callback
 * Suppressed local/global unused definition references (IDEA inspections)

## 2014-05-16
 * Use qs module instead of core querystring module for nested object support
 * Minor bug fixes
 * Added some function docs

## 2014-01-21
 * Added calls to invoke ProductSense

## 2014-01-17
 * Overall implementation done, largely untested
 
## 2014-01-16
 * Initial import / setup