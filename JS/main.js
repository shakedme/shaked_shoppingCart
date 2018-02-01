//Helper
//https://cmatskas.com/get-url-parameters-using-javascript/

var parseQueryString = function(url) {
    var urlParams = {};
    url.replace(
        new RegExp("([^?=&]+)(=([^&]*))?", "g"),
        function($0, $1, $2, $3) {
            urlParams[$1] = $3;
        }
    );

    return urlParams;
};

var urlParams = parseQueryString(location.search);

//Category Class

function CategoryManager() {

    //Set variables

    this.categoryURL = "http://api.origin.berlin/category";
    this.categories = [];
    this.menu = $('#navList');
    this.currentCategory = false;

    //Initalize methods

    this.init = function() {
        this.getCategories();
    };

    //Get Data

    this.getCategories = function() {
        var that = this;
        $.getJSON(this.categoryURL, function(data) {
            that.categories = data;
            that.displayCategories();
            that.getCurrentCategory();
        });
    };

    // Store in variable the category chosen.
    // Check if category is chosen via URL paramater, if so,
    //loop through all categories, find the one which matches the id 
    //of the URL param, and append to HTML correct category.

    this.getCurrentCategory = function() {
        var that = this;
        if (!urlParams.catID) return;
        $.each(this.categories, function(i, category) {
            if (category.id == urlParams.catID) {
                that.currentCategory = category;
                $('.category_name').text(category.name);
            };
        });
    };

    //Loop through data and append to HTML

    this.displayCategories = function() {
        var that = this;
        $.each(this.categories, function(i, category) {
            var li = $('<li>').addClass("nav-item");
            var a = $('<a>').addClass('nav-link').attr("href", "category.html?catID=" + category.id).text(category.name).appendTo(li);
            that.menu.append(li);
        });

    };
};


//Instantiate and initialize class

var categoryManager = new CategoryManager();
categoryManager.init();


//------------------------------------------------------



//Book Class

function BookManager() {

    //Set variables

    this.bookURL = "http://api.origin.berlin/book";
    this.books = [];
    this.currentBook = false;

    //Initialize methods

    this.init = function() {
        this.getBooks();
    };

    //Get data from API

    this.getBooks = function() {
        var that = this;
        $.getJSON(this.bookURL, function(data) {
            that.books = data;
            that.getCurrentBook();
            that.displayBooksCategory();
        });
    };

    // Store object of book chosen:
    // Check if book is chosen via URL paramater, if so,
    //loop through all books, find the one which matches the id 
    //of the URL param, and append to HTML correct book.

    this.getCurrentBook = function() {
        var that = this;
        if (!urlParams.book) return;
        $.each(this.books, function(i, book) {
            if (book.slug == urlParams.book) {
                that.currentBook = book;
                $('.book_author').text(book.author);
                $('.book_title').text(book.title);
                $('.book_year').text(book.date);
                $('.book_price').text(book.price + "$");
                $('.book_rating').text(book.rating);
                $('.book_review').text(book.reviews);
                $('.book_image').attr('src', book.image);
            };
        });
    };

    //Loop through data and append to HTML, according to category chosen.

    this.displayBooksCategory = function() {
        $.each(this.books, function(i, e) {
            if (urlParams.catID == e.category_id || urlParams.catID == undefined) {
                var div = $('<div>').addClass('col-3');
                var img = $('<a>').attr('href', 'detail.html?book=' + e.slug).append($('<img>').addClass('imgWidth').attr('src', e.image)).appendTo(div);
                var p = $('<p>').appendTo(div);
                var a = $('<a>').attr('href', 'detail.html?book=' + e.slug).text(e.title).appendTo(p);
                div.appendTo($('#all_books'));
            };
        });
    };
};

//Instantiate and initialize class

var bookManager = new BookManager();
bookManager.init();


/*-------------------------------------------------------*/



//Shopping Cart Class


function CartManager() {

    //Empty array for storing books

    this.books = [];


    //Initalize methods

    this.init = function() {
        this.bookToLocalStorage();
        this.cartAppender();
        this.deleteAll();
        this.deleteSpecific();
    };

    //Add click listener for delete button

    this.deleteAll = function() {
        $('#emptyCart').on('click', function() {
            $('#tbody').html('');
            localStorage.clear();
        });
    };

    //Add click listener for deleting specific book from cart

    this.deleteSpecific = function() {
    	var that = this;
        $(document).on('click', '.delSpecific', function() {
            $(this).parent().remove();
            var key = $(this).siblings('.book_id').text();
            localStorage.removeItem("book" + key);
        });
    };

    //On click of purchase, push book into local storage.

    this.bookToLocalStorage = function() {
        var that = this;
        $('#buy_book').on('click', function() {
            localStorage.setItem("book" + bookManager.currentBook.id, JSON.stringify(bookManager.currentBook));
            alert(bookManager.currentBook.title + " has been added to your cart.")
        });
    };

    //Loop through local storage, push books into array, loop through array
    //and append to shopping cart HTML.

    this.cartAppender = function() {
        var that = this;
        $(document).ready(function() {

            for (var i = 0; i < localStorage.length; i++) {
                var key = localStorage.key(i);
                var value = localStorage[key];
                that.books.push(JSON.parse(value));
            };

            var allRows = [];
            var sum = 0;
            $.each(that.books, function(i, e) {
                var row = $('<tr>');
                row.append($('<td>').addClass('book_id').text(e.id));
                row.append($('<td>').text(e.title));
                row.append($('<td>').text(e.author));
                row.append($('<td>').text(e.price + "$"));
                row.append($('<button>').addClass('btn btn-danger delSpecific').append($('<span>').addClass('fa fa-trash-o')));
                allRows.push(row);
                sum += e.price;
            });
            $('#tbody').append(allRows);
            var total = sum.toFixed(2);
            $('#totalSum').text(total+'$');
        });
    };
};


//Instantiate class

var cartManager = new CartManager();
cartManager.init();