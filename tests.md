# Changing URL

When you
    load page
  then
    open modal with url
      // url should change



# Reopening closed modals

When you
    load page
    open modal with url
    close modal
  then
    hit back btn
      // the modal should reopen with correct content
      // url should change
    hit back btn
      // the modal should close
      // url should change
    hit forward btn
      // the modal should reopen with correct content
      // url should change
    hit forward btn
      // the modal should close
      // url should change



# Refreshing when needed

When you
    load page
    open modal with url
    refresh page // should go to modal page
  then
    hit back button
      // should reload the first page



# Refreshing when needed 2

When you
    load page
    open modal with url
    close modal
    refresh page // should be in the same place
  then
    hit back button
      // should refresh page loading the modal page
