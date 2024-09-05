document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('book-form-modal');
    const addBookBtn = document.getElementById('add-book-btn');
    const closeModal = document.querySelector('.close');
    const form = document.getElementById('book-form');
    const deleteBtn = document.getElementById('delete-book-btn'); // Button for deleting a book
    const bookList = document.getElementById('book-list');
    const searchBar = document.getElementById('search-bar');
    const loginForm = document.getElementById('login-form');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const loginModal = document.getElementById('login-form-modal');

    let books = [];
    let editingBookIndex = null; // Track if adding or editing a book

    // Function to escape user inputs to prevent XSS
    function escapeHTML(str) {
        return str.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#039;');
    }

	// Your web app's Firebase configuration (you should replace this with your actual Firebase configuration)
	var firebaseConfig = {
	apiKey: "AIzaSyBxt2-O5UdOmmyvAbk3_LVRP7ulGvJOGoM",
	authDomain: "book-catalog-39f2b.firebaseapp.com",
	projectId: "book-catalog-39f2b",
	storageBucket: "book-catalog-39f2b.appspot.com",
	messagingSenderId: "610607159158",
	appId: "1:610607159158:web:dc0050120cac1a0e370c57",
	measurementId: "G-3M9KWMRPD9"
     };
     // Initialize Firebase
     firebase.initializeApp(firebaseConfig);
  
     // Initialize Firestore and Auth
     var db = firebase.firestore();
     var auth = firebase.auth(); 
	
    // Show login modal
    loginBtn.addEventListener('click', function() {
        loginModal.style.display = 'block';
	console.log("Login button clicked, modal opened");
    });

    // Firebase Auth State Change Listener
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            console.log('User logged in: ', user.email);
            // Hide login/register, show logout and load books
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'inline';
            loadBooks(); // Only load books if logged in
        } else {
            console.log('User logged out');
            // Show login, hide logout
            loginBtn.style.display = 'inline';
            logoutBtn.style.display = 'none';
            bookList.innerHTML = ''; // Clear book list if logged out
        }
    });

    // Handle Login Form Submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log('Logged in successfully');
                loginModal.style.display = 'none'; // Close the login modal
            })
            .catch((error) => {
                console.error('Login failed: ', error.message);
            });
    });

    // Handle Logout
    logoutBtn.addEventListener('click', function() {
        firebase.auth().signOut().then(() => {
            console.log('Logged out successfully');
        }).catch((error) => {
            console.error('Logout failed: ', error.message);
        });
    });

    // Close login modal if clicked outside of them (optional)
    window.addEventListener('click', function(event) {
        if (event.target == loginModal) {
            loginModal.style.display = 'none';
        }
    });
});

    // Function to load books from Firestore
    function loadBooks() {
        const user = firebase.auth().currentUser;
        if (user) {
            db.collection("books").get().then((querySnapshot) => {
                books = [];
                querySnapshot.forEach((doc) => {
                    books.push({ id: doc.id, ...doc.data() });
                });
                displayBooks([]); // Hide books initially
            }).catch((error) => {
                console.error("Error loading books: ", error);
            });
        } else {
            console.log('User not logged in');
        }
    }

    // Function to save a book to Firestore
    function saveBookToFirestore(book) {
        return db.collection("books").add(book);
    }

    // Function to update a book in Firestore
    function updateBookInFirestore(id, updatedBook) {
        return db.collection("books").doc(id).update(updatedBook);
    }

    // Function to delete a book from Firestore
    function deleteBookFromFirestore(id) {
        return db.collection("books").doc(id).delete();
    }

    // Function to display books
    function displayBooks(filteredBooks = []) {
        bookList.innerHTML = ''; // Clear the list

        if (filteredBooks.length === 0 && searchBar.value.trim() !== '') {
            const noResults = document.createElement('p');
            noResults.textContent = 'No results found.';
            bookList.appendChild(noResults);
        } else {
            filteredBooks.forEach((book, index) => {
                const bookItem = document.createElement('div');
                bookItem.classList.add('book-item');
                
                bookItem.innerHTML = `
                    <img src="${escapeHTML(book.cover) || 'cover.jpg'}" alt="Book Cover" class="book-cover">
                    <div class="book-info">
                        <h2>${escapeHTML(book.title)}</h2>
                        <p><strong>Author:</strong> ${escapeHTML(book.author)}</p>
                        <p><strong>Genre:</strong> ${escapeHTML(book.genre)}</p>
                        <p><strong>Description:</strong> ${escapeHTML(book.description)}</p>
                        <p><strong>ISBN:</strong> ${escapeHTML(book.isbn)}</p>
                        ${book.read ? '<p><strong>Status:</strong> Read</p>' : ''}
                        <button class="edit-book-btn" data-index="${index}">Edit</button>
                    </div>
                `;
                bookList.appendChild(bookItem);
            });

            const editButtons = document.querySelectorAll('.edit-book-btn');
            editButtons.forEach(button => {
                button.addEventListener('click', function () {
                    const bookIndex = button.getAttribute('data-index');
                    editBook(bookIndex);
                });
            });
        }
    }

    // Function to open the modal for editing a book
    function editBook(index) {
        editingBookIndex = index;
        const book = books[index];
        document.getElementById('title').value = book.title;
        document.getElementById('author').value = book.author;
        document.getElementById('isbn').value = book.isbn;
        document.getElementById('genre').value = book.genre;
        document.getElementById('description').value = book.description;
        document.getElementById('cover').value = book.cover;
        document.getElementById('read-checkbox').checked = book.read || false;
        document.getElementById('modal-title').textContent = 'Edit Book';
        deleteBtn.style.display = 'inline'; // Show delete button when editing
        modal.style.display = 'flex'; // Open the modal
        console.log("Edit book modal opened");
    }

    // Show the modal when "Add New Book" is clicked
    addBookBtn.addEventListener('click', function () {
        editingBookIndex = null; // Reset editingBookIndex when adding new book
        form.reset(); // Clear the form
        document.getElementById('modal-title').textContent = 'Add New Book';
        deleteBtn.style.display = 'none'; // Hide delete button for new books
        modal.style.display = 'flex'; // Open the modal
        console.log("Add new book modal opened");
    });

    // Close the modal when the "x" is clicked
    closeModal.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    // Add/Edit book form submission
    form.addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent form from reloading the page

        const bookData = {
            title: escapeHTML(document.getElementById('title').value),
            author: escapeHTML(document.getElementById('author').value),
            isbn: escapeHTML(document.getElementById('isbn').value),
            genre: escapeHTML(document.getElementById('genre').value),
            description: escapeHTML(document.getElementById('description').value),
            cover: escapeHTML(document.getElementById('cover').value),
            read: document.getElementById('read-checkbox').checked
        };

        console.log("Form submitted, book data:", bookData);

        if (editingBookIndex !== null) {
            const bookId = books[editingBookIndex].id;
            updateBookInFirestore(bookId, bookData).then(() => {
                loadBooks(); // Refresh the list after updating
            });
        } else {
            saveBookToFirestore(bookData).then(() => {
                loadBooks(); // Refresh the list after adding
            });
        }

        modal.style.display = 'none'; // Close the modal
    });

    // Delete book when delete button is clicked
    deleteBtn.addEventListener('click', function () {
        if (editingBookIndex !== null) {
            const bookId = books[editingBookIndex].id;
            deleteBookFromFirestore(bookId).then(() => {
                loadBooks(); // Refresh the list after deletion
                modal.style.display = 'none'; // Close the modal after deletion
            });
        }
    });

    // Dynamic search functionality
    searchBar.addEventListener('input', function () {
        const searchTerm = searchBar.value.toLowerCase();
        if (searchTerm === '') {
            displayBooks([]); // Hide all books if search bar is empty
        } else {
            const filteredBooks = books.filter(book => {
                return (
                    book.title.toLowerCase().includes(searchTerm) ||
                    book.author.toLowerCase().includes(searchTerm) ||
                    book.isbn.toLowerCase().includes(searchTerm)
                );
            });
            displayBooks(filteredBooks); // Show filtered books
        }
    });

    // Initial load of books from Firestore
    loadBooks();
});
