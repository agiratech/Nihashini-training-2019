import { browser, by, element, protractor, $, $$ } from 'protractor';

describe('Explore Filter', () => {

  it('audience filter', function() {
    browser.driver.getCurrentUrl().then(function(url) {
      browser.waitForAngularEnabled(false);
      if (/explore/.test(url)) {
        browser.sleep(20000).then(function() {
          const audience  =  element(by.css('.exploreForm')).all(by.tagName('li')).first();
          audience.click();
          browser.sleep(5000);
          const totPop  =  element(by.css('.audience-filter-tab')).all(by.tagName('li')).get(1);
          const populateId = element(by.id('total-population')).all(by.tagName('label')).get(0);
          browser.sleep(500);
          browser.actions().click(totPop).perform();
          browser.sleep(10000);
          const aud_search = $('#total-population .totalPopulationSearch');
            aud_search.sendKeys('adult');
          browser.actions().click(populateId).perform();
          const audienceApply  =  element(by.css('.totalPopulationAudienceSubmit'));
          browser.actions().click(audienceApply).perform();
          browser.sleep(5000);
          const aud_mkt_blk	=	$$('.inventory-summary .audienceMarketBlk').first();
          //const aud_mkt_blk = element(by.xpath('//app-explore-metrics/div[1]/div/div[3]'));
          expect(aud_mkt_blk.isDisplayed()).toBe(true);
          const selected_aud = element(by.xpath('//app-explore-metrics/div[1]/div/div[3]/ul/li/span'));
          expect(selected_aud.getText()).toBe('Adult Populatio...');
        });
      }
    });
  });

  it('market filter', function() {
    browser.driver.getCurrentUrl().then(function(url) {
      browser.waitForAngularEnabled(false);
      if (/explore/.test(url)) {
        browser.sleep(20000).then(function() {
        const market  =  element(by.css('.explore-filter-first-block')).element(by.tagName('a'));
        market.click();
        expect(element(by.id('market_0')).getAttribute('value')).toBe('58260bea-039b-45f0-85a0-b0f4a6595326');
        const marketId = element(by.id('market-filter')).element(by.tagName('label'));
        element(by.css('.market-search')).sendKeys('ab');
        browser.sleep(500);
        browser.actions().click(marketId).perform();
        browser.sleep(10000);
        const marketApply  =  element(by.css('.explore-filter-first-block')).element(by.buttonText('Apply'));
        browser.actions().click(marketApply).perform();
        browser.sleep(5000);
        expect(market.getCssValue('background-color')).toBe('rgba(146, 42, 149, 1)');
        const mkt_blk = element(by.xpath('//app-explore-metrics/div[1]/div/div[3]/ul/li[1]/span'));
        expect(mkt_blk.getText()).toBe('Abilene-Sweetwa...');
        const elements = element.all(by.tagName('app-explore-panel'));
        expect(elements.count()).toBeGreaterThanOrEqual(1);


        const sortButton = element(by.id('sort-button'));
        browser.actions().click(sortButton).perform();

        browser.sleep(500);
        const sortHeader	=	element.all(by.css('.filter-item')).first().all(by.tagName('li'));
        const sortApply4  =  sortHeader.get(4);
        browser.actions().click(sortApply4).perform();
        browser.sleep(5000);
        expect($('.inventory-list-pagecount').getText()).toContain('896 selected of');
        browser.actions().click(sortButton).perform();
        const sortApply5  =  sortHeader.get(5);
        browser.actions().click(sortApply5).perform();
        browser.sleep(5000);
        expect($('.inventory-list-pagecount').getText()).toContain('896 selected of');
        browser.actions().click(sortButton).perform();
        const sortApply6  =  sortHeader.get(6);
        browser.actions().click(sortApply6).perform();
        browser.sleep(5000);
        expect($('.inventory-list-pagecount').getText()).toContain('896 selected of');
        browser.actions().click(sortButton).perform();
        const sortApply7  =  sortHeader.get(7);
        browser.actions().click(sortApply7).perform();
        browser.sleep(5000);
        expect($('.inventory-list-pagecount').getText()).toContain('896 selected of');
        browser.actions().click(sortButton).perform();
        const sortApply8  =  sortHeader.get(8);
        browser.actions().click(sortApply8).perform();
        browser.sleep(5000);
        expect($('.inventory-list-pagecount').getText()).toContain('896 selected of');
        browser.actions().click(sortButton).perform();
        const sortApply9  =  sortHeader.get(9);
        browser.actions().click(sortApply9).perform();
        browser.sleep(5000);
        expect($('.inventory-list-pagecount').getText()).toContain('896 selected of');
        browser.actions().click(sortButton).perform();
        const sortApply2  =  sortHeader.get(2);
        browser.actions().click(sortApply2).perform();
        browser.sleep(5000);
        expect($('.inventory-list-pagecount').getText()).toContain('896 selected of');
        
        const select	=	$$('#select-button').get(1);
        browser.actions().click(select).perform();
        browser.sleep(2000);

        const saveInv	= element(by.css('.filter-actions')).element(by.css('.dropdown-menu-right')).all(by.tagName('a')).get(0);
        browser.actions().click(saveInv).perform();
        browser.sleep(2000);

        const packageName	=	$$('.workspaceForm #defaultForm-name').first().sendKeys('abc');
        const packageNotes	=	$('#exampleFormControlTextarea1').sendKeys('Test notes');
        const invApply = $$('.workspaceForm .geo-button').first();
        browser.sleep(2000);
        browser.actions().mouseMove(invApply).click().perform();
        browser.sleep(10000);

        const invOK	=	$('.swal2-buttonswrapper').all(by.tagName('button')).get(0);
        browser.actions().click(invOK).perform();
        browser.sleep(5000);
        });
      }
    });
  });

  it('location filter', function() {
    browser.driver.getCurrentUrl().then(function(url) {
      browser.waitForAngularEnabled(false);
      if (/explore/.test(url)) {
        browser.sleep(20000).then(function() {
          const location	= element(by.css('.explore-filter-second-block')).all(by.tagName('a')).get(2);
          browser.actions().click(location).perform();
          browser.sleep(10000);
          //expect(location.getCssValue('background-color')).toBe('rgba(146, 42, 149, 1)');

          const mapView	=	$('.list-item-location .map-view-btn');
          browser.actions().mouseMove(mapView).click().perform();
        	browser.sleep(10000);
        	expect(mapView.getCssValue('background-color')).toBe('rgba(146, 42, 149, 1)');

        	//const market  =  element(by.css('.explore-filter-first-block')).element(by.tagName('a'));
        	//market.click();
        	//element(by.css('.market-search')).clear().then(function() {
    				//element(by.css('.market-search')).sendKeys('uti');
					//});
        	//browser.sleep(8000);
        	const marketApply  =  element(by.css('.explore-filter-first-block')).element(by.buttonText('Apply'));
        	browser.actions().click(marketApply).perform();
        	browser.sleep(5000);
        
        	browser.actions().click(location).perform();
          browser.sleep(5000);

        	const drawBtn	=	$('.list-item-location .polygon-draw-btn');
          browser.actions().mouseMove(drawBtn).click().perform();
        	browser.sleep(8000);
        	expect(drawBtn.getCssValue('background-color')).toBe('rgba(146, 42, 149, 1)');

					const map = element(by.css('div.map-div'));
        	browser.actions().mouseMove(map).click().perform();

        	browser.actions()
      			.mouseMove(map, {x: 100, y: 100}) // 100px from left, 100 px from top of map
      			.mouseDown()
      			.mouseMove({x: 200, y: 0}) // 200px to the right of current location
      			.click()
      			.mouseMove({x: 200, y: 0})
      			.click()
      			.click()
      			.perform();

					browser.sleep(10000);

          browser.actions().click(location).perform();
          browser.sleep(5000);

          const geoSearch	=	$$('#search-locations').first().sendKeys('abb');

          const locationApply = $('#location-filter .filter-submenu-option-btn .geo-button');
        	browser.sleep(2000);
        	browser.actions().mouseMove(locationApply).click().perform();
        	browser.sleep(5000);

        	browser.actions().click(location).perform();
          browser.sleep(5000);

        	const locationClear = $('#location-filter .filter-submenu-option-btn .clear-btn');
        	browser.sleep(2000);
        	browser.actions().mouseMove(locationClear).click().perform();
        	const zoomOut	=	element(by.css('.map-zoom-out')).element(by.tagName('button'));
        	browser.sleep(2000);
        	browser.actions().mouseMove(zoomOut).click().perform();
        	browser.sleep(5000);
          
        });
      }
    });
  });

  it('more filter', function() {
    browser.driver.getCurrentUrl().then(function(url) {
      browser.waitForAngularEnabled(false);
      if (/explore/.test(url)) {
        browser.sleep(20000).then(function() {
          const more	= element(by.css('.explore-filter-second-block')).all(by.tagName('a')).get(3);
          browser.actions().click(more).perform();
          browser.sleep(10000);
          expect(more.getCssValue('background-color')).toBe('rgba(146, 42, 149, 1)');

          const gpElement	=	element(by.id('more-geopath-panel-filter')).element(by.tagName('input'));
          const gpId1	=	gpElement.sendKeys('398811');
          expect(element(by.id('more-filter')).all(by.tagName('button')).count()).toBe(2);
        	const moreApply = $('#more-filter .filter-submenu-option-btn .geo-button');
        	const outClick	=	$('#more-filter-parent');
        	const panelOutClick	=	element(by.id('more-filter-parent')).all(by.tagName('li')).get(0);
        	browser.actions().mouseMove(outClick).click().perform();
        	browser.sleep(2000);
        	const gpId2	=	gpElement.sendKeys('140895');
        	browser.actions().mouseMove(outClick).click().perform();
        	browser.sleep(2000);
        	const gpId3	=	gpElement.sendKeys('140772');
        	browser.actions().mouseMove(outClick).click().perform();
        	browser.sleep(2000);
        	browser.actions().mouseMove(moreApply).click().perform();
        	browser.sleep(2000);
        	browser.actions().mouseMove(moreApply).click().perform();
        	browser.sleep(5000);
        	 // moreApply.click();
        	//browser.actions().click(moreApply).perform();
          browser.actions().click(more).perform();
          browser.sleep(10000);

          const panel	= element(by.id('more-filter')).all(by.tagName('a')).get(1);
        	browser.actions().click(panel).perform();
          browser.sleep(5000);
          const pidElement	=	element(by.id('more-operator-panel-filter')).element(by.tagName('input'));
        	const panelId1	=	pidElement.sendKeys('25991');
        	browser.actions().mouseMove(panelOutClick).click().perform();
        	browser.sleep(2000);
        	const panelId2	=	pidElement.sendKeys('1149');
        	browser.actions().mouseMove(panelOutClick).click().perform();
        	browser.sleep(2000);
        	const panelId3	=	pidElement.sendKeys('1098');
        	browser.actions().mouseMove(panelOutClick).click().perform();
        	browser.sleep(2000);
        	
        	const morePidApply = $('#more-filter .filter-submenu-option-btn .geo-button');
        	browser.sleep(2000);
        	expect(morePidApply.getCssValue('background-color')).toBe('rgba(146, 42, 149, 1)');
        	browser.actions().mouseMove(morePidApply).click().perform();
        	browser.sleep(2000);
        	browser.actions().mouseMove(morePidApply).click().perform();
        	browser.sleep(3000);

        	browser.actions().click(more).perform();
          browser.sleep(8000);

        	const savedInventory	= element(by.id('more-filter')).all(by.tagName('a')).get(2);
        	browser.actions().click(savedInventory).perform();
          browser.sleep(5000);

					const searInvList	=	element(by.id('more-package-filter')).all(by.tagName('input')).get(0);
          searInvList.sendKeys('abc');

          const invList	=	$('.packages-data-div').all(by.tagName('a')).get(0);
					browser.actions().click(invList).perform();
          browser.sleep(5000);

          const moreInvApply = $('#more-filter .filter-submenu-option-btn .geo-button');
        	browser.sleep(2000);
        	expect(moreInvApply.getCssValue('background-color')).toBe('rgba(146, 42, 149, 1)');
        	browser.actions().mouseMove(moreInvApply).click().perform();
        	browser.sleep(3000);

        	browser.actions().click(more).perform();
          browser.sleep(10000);

          searInvList.clear().then(function() {
    				searInvList.sendKeys('abc');
					});

          const invListEdit	=	$('.packages-data-div').all(by.tagName('a')).get(1);
					browser.actions().click(invListEdit).perform();
          browser.sleep(5000);

          const editPackageName	=	$$('.workspaceForm #defaultForm-name').first();
          editPackageName.clear().then(function() {
    				editPackageName.sendKeys('Test Package 2');
					});
          
        	const invApply = $$('.workspaceForm .geo-button').first();
        	browser.sleep(2000);
        	browser.actions().mouseMove(invApply).click().perform();
        	browser.sleep(20000);

        	const editOK	=	$('.swal2-buttonswrapper').all(by.tagName('button')).get(0);
          browser.actions().click(editOK).perform();
          browser.sleep(5000);

        	browser.actions().click(more).perform();
          browser.sleep(8000);

          searInvList.clear().then(function() {
    				searInvList.sendKeys('Test Package 2');
					});
          
          const invListDel	=	$('.packages-data-div').all(by.tagName('a')).get(2);
					browser.actions().click(invListDel).perform();
          browser.sleep(5000);

          const delConfirm	=	$('.swal2-buttonswrapper').all(by.tagName('button')).get(0);
          browser.actions().click(delConfirm).perform();
          browser.sleep(5000);

          const delOK	=	$('.swal2-buttonswrapper').all(by.tagName('button')).get(0);
          browser.actions().click(delOK).perform();
          browser.sleep(5000);

          browser.actions().click(more).perform();
          browser.sleep(5000);

          searInvList.clear();
          browser.sleep(1000);

        	const moreClear = $('#more-filter .filter-submenu-option-btn .clear-btn');
        	browser.sleep(2000);
        	browser.actions().mouseMove(moreClear).click().perform();
        	browser.sleep(5000);
        
        });
        
      }
    });
  });

});
