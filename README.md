# fl-modal-router
[![Build Status](https://travis-ci.org/fourlabsldn/fl-modal-router.svg?branch=master)](https://travis-ci.org/fourlabsldn/fl-modal-router)

## The goals of the modal router are:
- back button to dismiss modal
- forward button to reopen modal
- back to modal with back button if closed modal pressing 'x'
- no modal load from URL


## Decision point:

If I am on a page and I
  1 - open a modal
  2 - close a modal
  3 - refresh the page
What should the back buton do?
  - Go to the modal URL refreshing the page, as we cannot assume that the modal content is setup, or even that it exists after the refresh.
  - Assume the modal content is there and try to open it
  - Try to open it, if it doesn't work, then refresh it.

The approach we are taking here is to assume the least possible, so we perform a full refresh.


# Development
```
npm run dev
```

# Demo
```
npm run demo
```


# Install
## Bower
```
bower install fl-modal-router --save
```
