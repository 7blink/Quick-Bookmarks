
function createMenuIfNeeded(){
	var doesBookmarksMenuExist = browser.bookmarks.search({title: 'Quick Bookmarks'});
	doesBookmarksMenuExist.then(onMainMenuFulfilled, onRejected);
}

function onMainMenuFulfilled(bookmarkItems){
	if(bookmarkItems.length < 1){
		createQuickBookmarksMenu()
	}else{
		createContextMenu()
	}
}

function createQuickBookmarksMenu(){
	function onBTFulfilled(bookmarkItems){
		browser.bookmarks.create({title: "Quick Bookmarks", parentId: bookmarkItems[0].id, index: 1});
	}
	var getBookmarksToolbar = browser.bookmarks.search({title: 'Bookmarks Menu'});
	getBookmarksToolbar.then(onBTFulfilled, onRejected);
}

createMenuIfNeeded();


/*
//Create Context Menu
*/
function onFulfilled(bookmarkItems) {
	browser.contextMenus.create({
		id: 'Create Quick Bookmark',
		title: 'Create Quick Bookmark',
		"onclick": createQuickBookmark,
	});

	function logItems(bookmarkItem) {
	  if (bookmarkItem.url) {
		var id = bookmarkItem.title;
		browser.contextMenus.create({
			id: id,
			title: id,
			"onclick": openInNewTab,
		});
	  }
	  if (bookmarkItem.children) {
	    for (child of bookmarkItem.children) {
	      logItems(child);
	    }
	  }
	}

	function logSubTree(bookmarkItems) {
	  logItems(bookmarkItems[0]);
	}

	var subTreeID = bookmarkItems[0].id;

	var gettingSubTree = browser.bookmarks.getSubTree(subTreeID);
	gettingSubTree.then(logSubTree, onRejected);
}

function onRejected(error) {
	console.log(`An error: ${error}`);
}

function createContextMenu(){
	var searching = browser.bookmarks.search({title: 'Quick Bookmarks'});
	searching.then(onFulfilled, onRejected);
}



/*
Open page in a new tab
*/
function openInNewTab(info, tab){
	function onFulfilled(bookmarkItems) {
		function onCreated(tab) {
		  console.log(`Created new tab: ${tab.id}`)
		}
		var creating = browser.tabs.create({
	    	url:bookmarkItems[0].url
	  	});

		creating.then(onCreated, onRejected);
	}

	function onRejected(error) {
	  console.log(`An error: ${error}`);
	}
	var searching = browser.bookmarks.search({title: info.menuItemId});
	searching.then(onFulfilled, onRejected);
}

/*
Open page in a new tab
*/
function createQuickBookmark(){
	function onBTFulfilled(bookmarkItems){
		createBookmarkIfNonExists(bookmarkItems);
	}
	var getBookmarksToolbar = browser.bookmarks.search({title: 'Quick Bookmarks'});
	getBookmarksToolbar.then(onBTFulfilled, onRejected);
}

function createBookmarkIfNonExists(bookmarkItems){

	function createBookmark(tabs) {
		if (tabs[0]) {
			function onBookmarksIfExistsFulfilled(bookmarkItems){
				if(bookmarkItems.length < 1){
					browser.bookmarks.create({title: currentTab.title, url: currentTab.url, parentId: quickBookmarksMenuId});
				}else{
					return;
				}
			}
			    currentTab = tabs[0];
			  	var getBookmarksIfExists = browser.bookmarks.search({title: currentTab.title});
			  	getBookmarksIfExists.then(onBookmarksIfExistsFulfilled, onRejected);
		}
	}
	var quickBookmarksMenuId = bookmarkItems[0].id;
	var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
	gettingActiveTab.then(createBookmark);
}


/*
	refresh the context menu
*/
function contextMenuRefresh(){
	function onRemoved() {
		setTimeout(createContextMenu, 100);
	  	//createContextMenu();
	}
    var removing = browser.contextMenus.removeAll();
    removing.then(onRemoved);
}

/*
	Init
*/

// listen for bookmarks being created
browser.bookmarks.onCreated.addListener(contextMenuRefresh);
// listen for bookmarks being removed
browser.bookmarks.onRemoved.addListener(contextMenuRefresh);
// listen for bookmarks being changed
browser.bookmarks.onChanged.addListener(contextMenuRefresh);
// listen for bookmarks being moved
browser.bookmarks.onMoved.addListener(contextMenuRefresh);
