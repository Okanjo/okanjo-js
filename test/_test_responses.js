"use strict";

module.exports.getExampleAdxResponse = () => {
    return {
        statusCode: 200,
        data: {
            type: 'adx',
            article: null,
            test: null,
            backfilled: true,
            shortfilled: false,
            results: [],
            total: 0,
            settings: {
                filters: {},
                display: {},
                placement_tests_only: false
            }
        }
    };
};

module.exports.getExampleArticlesResponse = () => {
    return {
        statusCode: 200,
        data: {
            type: 'articles',
            backfilled: false,
            shortfilled: false,
            article: null,
            test: null,
            results: [
                {
                    "id": "article_test_2gWFnrrPHhoJPDQoF",
                    "status": "active",
                    "url": "http://unit.test/1",
                    "title": "Staying fresh: Judd Hirsch says working keeps him young",
                    "author": "Bruce R. Miller Bmiller@siouxcityjournal.com",
                    "published": "2017-02-05T14:00:00.000Z",
                    "publisher_name": "madison.com",
                    "image": "http://bloximages.chicago2.vip.townnews.com/host.madison.com/content/tncms/assets/v3/editorial/3/26/32660507-c04d-5a8f-9efc-194d80a432bd/5891c71ea581c.image.jpg?resize=420%2C630",
                    "description": "LOS ANGELES | Work, actor Judd Hirsh says, is what keeps people from getting old.",
                    "tags": [],
                    "url_category": [],
                    "url_keywords": [],
                    "fetched_date": "2017-05-12T14:05:44.578Z",
                    "organization_id": "org_test_2gWFnrrPHhoJPDQoD",
                    "property_id": "prop_test_2gWFnrrPHhoJPDQoE",
                    "placement_id": "placement_test_2gWFnrrPHhoJPDQoC",
                    "created": "2017-05-12T14:05:44.567Z",
                    "updated": "2017-05-12T14:05:45.460Z",
                    "backfill": false,
                    "shortfill": false,
                    "_cid": "SSCLK2EiyYZ5Y4EriWsEaC0Ech1"
                },
                {
                    "id": "article_test_2gWFnrrPHhoJPDQoA",
                    "status": "active",
                    "url": "http://unit.test/2",
                    "title": "Unit test title 006",
                    "author": "Okanjo Flamingo",
                    "published": "2017-05-12T14:05:44.553Z",
                    "publisher_name": "Okanjo Times",
                    "image": "http://i.imgur.com/27rCTe5.png",
                    "description": "This seems like it would describe my test article",
                    "tags": [
                        "tag 1",
                        "tag 2"
                    ],
                    "url_category": [
                        "A",
                        "B",
                        "C"
                    ],
                    "url_keywords": [
                        "D",
                        "E",
                        "F"
                    ],
                    "url_selectors": "h1,p,div.sample",
                    "fetched_date": "2017-05-12T14:05:44.553Z",
                    "organization_id": "org_test_2gWFnrrPHhoJPDQo7",
                    "property_id": "prop_test_2gWFnrrPHhoJPDQo8",
                    "placement_id": "placement_test_2gWFnrrPHhoJPDQo9",
                    "created": "2017-05-12T14:05:44.554Z",
                    "updated": "2017-05-12T14:05:44.561Z",
                    "backfill": false,
                    "shortfill": false,
                    "_cid": "SSCLK2EiyYZ5Y4EriWsEaC0Ech2"
                },
                {
                    "id": "article_test_2gWFnrrPHhoJPDQoA",
                    "status": "active",
                    "url": "http://unit.test/3",
                    "title": "This is a really long title so it should wrap so nice and gracefully so it should wrap so nice and gracefully so it should wrap so nice and gracefully",
                    "author": "Wayne's Mother",
                    "published": "2017-05-12T14:05:44.553Z",
                    "publisher_name": "Okanjo Times",
                    "image": null,
                    "description": "This seems like it would describe my test article",
                    "tags": [
                        "tag 1",
                        "tag 2"
                    ],
                    "url_category": [
                        "A",
                        "B",
                        "C"
                    ],
                    "url_keywords": [
                        "D",
                        "E",
                        "F"
                    ],
                    "url_selectors": "h1,p,div.sample",
                    "fetched_date": "2017-05-12T14:05:44.553Z",
                    "organization_id": "org_test_2gWFnrrPHhoJPDQo7",
                    "property_id": "prop_test_2gWFnrrPHhoJPDQo8",
                    "placement_id": "placement_test_2gWFnrrPHhoJPDQo9",
                    "created": "2017-05-12T14:05:44.554Z",
                    "updated": "2017-05-12T14:05:44.561Z",
                    "backfill": false,
                    "shortfill": false,
                    "_cid": "SSCLK2EiyYZ5Y4EriWsEaC0Ech3"
                },
                {
                    "id": "article_test_2gWFnrrPHhoJPDQoA",
                    "status": "active",
                    "url": "http://unit.test/4",
                    "title": "This is a really long title so it should wrap so nice and gracefully so it should wrap so nice and gracefully so it should wrap so nice and gracefully",
                    "author": "Wayne's Father",
                    "published": "2017-05-12T14:05:44.553Z",
                    "publisher_name": "Okanjo Times",
                    "image": null,
                    "description": "This seems like it would describe my test article",
                    "tags": [
                        "tag 1",
                        "tag 2"
                    ],
                    "url_category": [
                        "A",
                        "B",
                        "C"
                    ],
                    "url_keywords": [
                        "D",
                        "E",
                        "F"
                    ],
                    "url_selectors": "h1,p,div.sample",
                    "fetched_date": "2017-05-12T14:05:44.553Z",
                    "organization_id": "org_test_2gWFnrrPHhoJPDQo7",
                    "property_id": "prop_test_2gWFnrrPHhoJPDQo8",
                    "placement_id": "placement_test_2gWFnrrPHhoJPDQo9",
                    "created": "2017-05-12T14:05:44.554Z",
                    "updated": "2017-05-12T14:05:44.561Z",
                    "backfill": false,
                    "shortfill": false,
                    "_cid": "SSCLK2EiyYZ5Y4EriWsEaC0Ech4"
                },
                {
                    "id": "article_test_2gWFnrrPHhoJPDQoA",
                    "status": "active",
                    "url": "http://unit.test/5",
                    "title": "This is a really long title so it should wrap so nice and gracefully so it should wrap so nice and gracefully so it should wrap so nice and gracefully",
                    "author": "Wayne's Brother",
                    "published": "2017-05-12T14:05:44.553Z",
                    "publisher_name": "Okanjo Times",
                    "image": null,
                    "description": "This seems like it would describe my test article",
                    "tags": [
                        "tag 1",
                        "tag 2"
                    ],
                    "url_category": [
                        "A",
                        "B",
                        "C"
                    ],
                    "url_keywords": [
                        "D",
                        "E",
                        "F"
                    ],
                    "url_selectors": "h1,p,div.sample",
                    "fetched_date": "2017-05-12T14:05:44.553Z",
                    "organization_id": "org_test_2gWFnrrPHhoJPDQo7",
                    "property_id": "prop_test_2gWFnrrPHhoJPDQo8",
                    "placement_id": "placement_test_2gWFnrrPHhoJPDQo9",
                    "created": "2017-05-12T14:05:44.554Z",
                    "updated": "2017-05-12T14:05:44.561Z",
                    "backfill": false,
                    "shortfill": false,
                    "_cid": "SSCLK2EiyYZ5Y4EriWsEaC0Ech5"
                }
            ],
            total: 2,
            settings: {
                filters: {},
                display: {
                    size: 'half_page',
                    template_layout: 'list',
                    template_cta_style: 'link'
                },
                placement_tests_only: false
            }
        }
    };
};

module.exports.getExampleProductResponse = () => {
    return {
        statusCode: 200,
        data: {
            type: 'products',
            backfilled: false,
            shortfilled: false,
            article: { id: 'article_local_2gT3kBcwVQZ1kpEma' },
            test: null,
            results: [
                {
                    "id": "product_test_2gT3kBcwVQZ1kpEma",
                    "store_id": "store_2gT3kBcwVQZ1kpEmc",
                    "store_name": "NFLShop.com",
                    "property_id": null,
                    "organization_id": "org_2gT3kBcwVQZ1kpEmd",
                    "organization_name": "ShareASale",
                    "status": "active",
                    "name": "Women's Chicago Bears Majestic Navy Blue Gametime Gal V-Neck Long Sleeve T-Shirt",
                    "description": "Get in the game this season with this Chicago Bears Gametime Gal long sleeve T-shirt from Majestic. Everyone will know who you are rooting for with this Chicago Bears tee! It features Chicago Bears graphics along with a rib-knit collar. NFL Shop is your source for officially licensed Chicago Bears gear.",
                    "image_urls": ["http://fansedge.frgimages.com/FFImage/thumb.aspx?i=%2FproductImages%2F_1680000%2Fff_1680297_xl.jpg"],
                    "price": 39.99,
                    "buy_url": "http://www.shareasale.com/m-pr.cfm?merchantID=52555&userID=1241092&productID=575333915",
                    "buy_url_track_param": "afftrack",
                    "tags": ["Jay Cutler", "Alshon Jeffrey", "Kevin White", "Brian Hoyer", "Zach Miller", "Kyle Long", "Leonard Floyd", "Soldier Field", "Chicago Bears"],
                    "category": ["Uncategorized"],
                    "pools": ["NWISports", "PantagraphSports", "TheSouthernSports", "QCTimesSports", "JGTCSports", "ProFootballWeekly", "HeraldReviewSports"],
                    "external_store_id": "14fb2a08c7e74594dc2948062df5e3eb",
                    "condition": "unspecified",
                    "currency": "USD",
                    "meta": {
                        "origin": "ads_sync",
                        "instance_id": "101010101010101010101010101",
                        "vendor_id": "shareasale",
                        "offer_id": "55555_1112223",
                        "curator": "Overwatch ",
                        "curator_id": "",
                        "curator_email": "support@okanjo.com"
                    },
                    "created": "2017-05-02T19:00:05.519Z",
                    "updated": null,
                    "backfill": false,
                    "shortfill": false,
                    "_cid": "SSCLK2EiyYZ5Y4EriWsEaC0Ech26"
                }, {
                    "id": "product_test_2gT3kBcwVQZ1kpEmb",
                    "store_id": "store_2gT3kBcwVQZ1kpEmc",
                    "store_name": "NFLShop.com",
                    "property_id": null,
                    "organization_id": "org_2gT3kBcwVQZ1kpEmd",
                    "organization_name": "ShareASale",
                    "status": "active",
                    "name": "Autographed Dallas Cowboys Dak Prescott Fanatics Authentic Riddell Speed Mini Helmet",
                    "description": "This mini helmet has been personally hand-signed by Dak Prescott. It is officially licensed by the National Football League and comes with an individually numbered, tamper-evident hologram from Fanatics Authentic. To ensure authenticity, the hologram can be reviewed online. This process helps to ensure that the product purchased is authentic and eliminates any possibility of duplication or fraud",
                    "image_urls": ["http://fansedge.frgimages.com/FFImage/thumb.aspx?i=%2FproductImages%2F_2586000%2Fff_2586446_full.jpg"],
                    "price": 299.99,
                    "buy_url": "http://www.shareasale.com/m-pr.cfm?merchantID=52555&userID=1241092&productID=675783405",
                    "buy_url_track_param": "afftrack",
                    "tags": ["Chris Klieman", "Fargodome", "Missouri Valley Football Conference", "Thundar"],
                    "category": ["Uncategorized"],
                    "pools": ["BismarckTribuneSports", "BisonMedia"],
                    "external_store_id": "14fb2a08c7e74594dc2948062df5e3eb",
                    "condition": "unspecified",
                    "currency": "USD",
                    "meta": {
                        "origin": "ads_sync",
                        "instance_id": "101010101010101010101010101",
                        "vendor_id": "shareasale",
                        "offer_id": "52555_2586446",
                        "curator": "Overwatch ",
                        "curator_id": "",
                        "curator_email": "support@okanjo.com"
                    },
                    "created": "2017-04-30T19:00:14.114Z",
                    "updated": "2017-05-02T19:00:18.048Z",
                    "backfill": false,
                    "shortfill": false,
                    "_cid": "SSCLK2EiyYZ5Y4EriWsEaC0Ech7"
                }
            ],
            total: 2,
            settings: {
                filters: {},
                display: {},
                placement_tests_only: false
            }
        }
    };
};

module.exports.getExampleSplitfillProductResponse = () => {
    return {
        statusCode: 200,
        data: [
            {
                type: 'products',
                backfilled: false,
                shortfilled: false,
                article: { id: 'article_local_2gT3kBcwVQZ1kpEma' },
                test: null,
                splitfilled: true,
                results: [
                    {
                        "id": "product_test_2gT3kBcwVQZ1kpEma",
                        "store_id": "store_2gT3kBcwVQZ1kpEmc",
                        "store_name": "NFLShop.com",
                        "property_id": null,
                        "organization_id": "org_2gT3kBcwVQZ1kpEmd",
                        "organization_name": "ShareASale",
                        "status": "active",
                        "name": "Women's Chicago Bears Majestic Navy Blue Gametime Gal V-Neck Long Sleeve T-Shirt",
                        "description": "Get in the game this season with this Chicago Bears Gametime Gal long sleeve T-shirt from Majestic. Everyone will know who you are rooting for with this Chicago Bears tee! It features Chicago Bears graphics along with a rib-knit collar. NFL Shop is your source for officially licensed Chicago Bears gear.",
                        "image_urls": ["http://fansedge.frgimages.com/FFImage/thumb.aspx?i=%2FproductImages%2F_1680000%2Fff_1680297_xl.jpg"],
                        "price": 39.99,
                        "buy_url": "http://www.shareasale.com/m-pr.cfm?merchantID=52555&userID=1241092&productID=575333915",
                        "buy_url_track_param": "afftrack",
                        "tags": ["Jay Cutler", "Alshon Jeffrey", "Kevin White", "Brian Hoyer", "Zach Miller", "Kyle Long", "Leonard Floyd", "Soldier Field", "Chicago Bears"],
                        "category": ["Uncategorized"],
                        "pools": ["NWISports", "PantagraphSports", "TheSouthernSports", "QCTimesSports", "JGTCSports", "ProFootballWeekly", "HeraldReviewSports"],
                        "external_store_id": "14fb2a08c7e74594dc2948062df5e3eb",
                        "condition": "unspecified",
                        "currency": "USD",
                        "meta": {
                            "origin": "ads_sync",
                            "instance_id": "101010101010101010101010101",
                            "vendor_id": "shareasale",
                            "offer_id": "55555_1112223",
                            "curator": "Overwatch ",
                            "curator_id": "",
                            "curator_email": "support@okanjo.com"
                        },
                        "created": "2017-05-02T19:00:05.519Z",
                        "updated": null,
                        "backfill": false,
                        "shortfill": false,
                        "_cid": "SSCLK2EiyYZ5Y4EriWsEaC0Ech8"
                    },
                ],
                total: 1,
                settings: {
                    filters: {},
                    display: {},
                    placement_tests_only: false
                }
            },
            {
                type: 'articles',
                backfilled: true,
                shortfilled: true,
                article: null,
                test: null,
                results: [
                    {
                        "id": "article_test_2gWFnrrPHhoJPDQoF",
                        "status": "active",
                        "url": "http://unit.test/1",
                        "title": "Staying fresh: Judd Hirsch says working keeps him young",
                        "author": "Bruce R. Miller Bmiller@siouxcityjournal.com",
                        "published": "2017-02-05T14:00:00.000Z",
                        "publisher_name": "madison.com",
                        "image": "http://bloximages.chicago2.vip.townnews.com/host.madison.com/content/tncms/assets/v3/editorial/3/26/32660507-c04d-5a8f-9efc-194d80a432bd/5891c71ea581c.image.jpg?resize=420%2C630",
                        "description": "LOS ANGELES | Work, actor Judd Hirsh says, is what keeps people from getting old.",
                        "tags": [],
                        "url_category": [],
                        "url_keywords": [],
                        "fetched_date": "2017-05-12T14:05:44.578Z",
                        "organization_id": "org_test_2gWFnrrPHhoJPDQoD",
                        "property_id": "prop_test_2gWFnrrPHhoJPDQoE",
                        "placement_id": "placement_test_2gWFnrrPHhoJPDQoC",
                        "created": "2017-05-12T14:05:44.567Z",
                        "updated": "2017-05-12T14:05:45.460Z",
                        "backfill": true,
                        "shortfill": true,
                        "_cid": "SSCLK2EiyYZ5Y4EriWsEaC0Ech1"
                    },
                ],
                total: 2,
                settings: {
                    filters: {
                        take: 1
                    },
                    display: {},
                    placement_tests_only: false
                }
            },
            {
                type: 'adx',
                article: null,
                test: null,
                backfilled: true,
                shortfilled: false,
                results: [],
                total: 0,
                settings: {
                    filters: {},
                    display: {
                        adx_unit_path: '/publisher/slot-path',
                        size: 'medium_rectangle'
                    },
                    placement_tests_only: false
                }
            }
        ]
    };
};

module.exports.getExampleSplitfillArticlesResponse = () => {
    return {
        statusCode: 200,
        data: {
            type: 'articles',
            backfilled: false,
            shortfilled: false,
            article: null,
            test: null,
            splitfilled: true,
            results: [
                {
                    "id": "article_test_2gWFnrrPHhoJPDQoF",
                    "status": "active",
                    "url": "http://unit.test/1",
                    "title": "Staying fresh: Judd Hirsch says working keeps him young",
                    "author": "Bruce R. Miller Bmiller@siouxcityjournal.com",
                    "published": "2017-02-05T14:00:00.000Z",
                    "publisher_name": "madison.com",
                    "image": "http://bloximages.chicago2.vip.townnews.com/host.madison.com/content/tncms/assets/v3/editorial/3/26/32660507-c04d-5a8f-9efc-194d80a432bd/5891c71ea581c.image.jpg?resize=420%2C630",
                    "description": "LOS ANGELES | Work, actor Judd Hirsh says, is what keeps people from getting old.",
                    "tags": [],
                    "url_category": [],
                    "url_keywords": [],
                    "fetched_date": "2017-05-12T14:05:44.578Z",
                    "organization_id": "org_test_2gWFnrrPHhoJPDQoD",
                    "property_id": "prop_test_2gWFnrrPHhoJPDQoE",
                    "placement_id": "placement_test_2gWFnrrPHhoJPDQoC",
                    "created": "2017-05-12T14:05:44.567Z",
                    "updated": "2017-05-12T14:05:45.460Z",
                    "backfill": false,
                    "shortfill": false,
                    "splitfill_segment": "test split segment",
                    "_cid": "SSCLK2EiyYZ5Y4EriWsEaC0Ec10"
                },
                {
                    "id": "article_test_2gWFnrrPHhoJPDQoA",
                    "status": "active",
                    "url": "http://unit.test/2",
                    "title": "Unit test title 006",
                    "author": "Okanjo Flamingo",
                    "published": "2017-05-12T14:05:44.553Z",
                    "publisher_name": "Okanjo Times",
                    "image": "http://i.imgur.com/27rCTe5.png",
                    "description": "This seems like it would describe my test article",
                    "tags": [
                        "tag 1",
                        "tag 2"
                    ],
                    "url_category": [
                        "A",
                        "B",
                        "C"
                    ],
                    "url_keywords": [
                        "D",
                        "E",
                        "F"
                    ],
                    "url_selectors": "h1,p,div.sample",
                    "fetched_date": "2017-05-12T14:05:44.553Z",
                    "organization_id": "org_test_2gWFnrrPHhoJPDQo7",
                    "property_id": "prop_test_2gWFnrrPHhoJPDQo8",
                    "placement_id": "placement_test_2gWFnrrPHhoJPDQo9",
                    "created": "2017-05-12T14:05:44.554Z",
                    "updated": "2017-05-12T14:05:44.561Z",
                    "backfill": false,
                    "shortfill": false,
                    "splitfill_segment": null,
                    "_cid": "SSCLK2EiyYZ5Y4EriWsEaC0Ec11"
                }
            ],
            total: 2,
            settings: {
                filters: {},
                display: {
                    size: 'half_page',
                    template_layout: 'list',
                    template_cta_style: 'link'
                },
                placement_tests_only: false
            }
        }
    };
};