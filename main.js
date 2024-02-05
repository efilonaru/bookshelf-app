const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKS_DATA";

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

function findBook(bookId) {
  for (const book of books) {
    if (book.id === bookId) {
      return book;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function makeBook(book) {
  const { id, title, author, year, isComplete } = book;

  const bookTitle = document.createElement("h3");
  bookTitle.innerText = title;

  const bookAuthor = document.createElement("p");
  bookAuthor.innerText = `Penulis: ${author}`;

  const bookYear = document.createElement("p");
  bookYear.innerText = `Tahun Terbit: ${year}`;

  const textContainer = document.createElement("div");
  textContainer.classList.add("inner");
  textContainer.append(bookTitle, bookAuthor, bookYear);

  const container = document.createElement("div");
  container.classList.add("book-card");

  if (isComplete) {
    const markUnreadButton = document.createElement("button");
    markUnreadButton.innerText = "Tandai Belum Selesai";
    markUnreadButton.classList.add("btn-mark-unread");
    markUnreadButton.addEventListener("click", function () {
      markAsUnread(id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Hapus";
    deleteButton.classList.add("btn-delete");
    deleteButton.addEventListener("click", function () {
      deleteBook(id);
    });

    container.append(textContainer, markUnreadButton, deleteButton);
  } else {
    const markReadButton = document.createElement("button");
    markReadButton.innerText = "Tandai Selesai";
    markReadButton.classList.add("btn-mark-read");
    markReadButton.addEventListener("click", function () {
      markAsRead(id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Hapus";
    deleteButton.classList.add("btn-delete");
    deleteButton.addEventListener("click", function () {
      deleteBook(id);
    });

    container.append(textContainer, markReadButton, deleteButton);
  }

  return container;
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addBook() {
  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const year = parseInt(document.getElementById("year").value);
  const isComplete = document.getElementById("inputBookisComplete").checked;

  if (title === "" || author === "" || isNaN(year)) {
    alert("Mohon lengkapi semua field sebelum menambahkan buku.");
    return;
  }

  const generatedID = generateId();
  const bookObject = generateBookObject(
    generatedID,
    title,
    author,
    year,
    isComplete
  );
  books.push(bookObject);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

document.addEventListener("DOMContentLoaded", function () {
  if (isStorageExist()) {
    loadDataFromStorage();
  }
  const submitForm = document.getElementById("form");

  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });
});

document.addEventListener(RENDER_EVENT, function () {
  const bookListCompleted = document.getElementById("book-list-completed");
  const bookListUncompleted = document.getElementById("book-list-uncompleted");

  bookListCompleted.innerHTML = "";
  bookListUncompleted.innerHTML = "";

  for (const book of books) {
    const bookCard = makeBook(book);
    if (book.isComplete) {
      bookListCompleted.append(bookCard);
    } else {
      bookListUncompleted.append(bookCard);
    }
  }
});

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  const data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function markAsRead(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function markAsUnread(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function deleteBook(bookId) {
  const bookIndex = findBookIndex(bookId);
  if (bookIndex === -1) return;

  books.splice(bookIndex, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function searchBook() {
  const searchInput = document.getElementById("search").value.toLowerCase();
  const bookCards = document.querySelectorAll(".book-card");

  bookCards.forEach((card) => {
    const title = card.querySelector("h3").textContent.toLowerCase();
    if (title.includes(searchInput)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

document.getElementById("search").addEventListener("input", searchBook);
