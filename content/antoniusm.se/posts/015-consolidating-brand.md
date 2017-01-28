---
title: Consolidating the brand
pageTitle: Building my brand
layout: post
posted: 2016-12-13 13:00:00
article: true
metaType: article
excerpt: The index post, and first step for, building up my brand across sites and social media.
category: Tangential Tutorials
tags:
    - brand
    - series index
featuredImage: consolidating-brands
menu: false
---

<p class="c-lead c-lead--ornamented"><span class="c-lead__opening">Since I am part of [Raimey Gallant's Blog Hop](https://raimeygallant.wordpress.com/2016/12/05/nano-blog-social-media-hop-time-to-start-hopping/) I decided</span> to look over my "brand" on social media and my sites. Now, I am *not* a marketing specialist, nor a designer, so this will be a WIP and a learning curve.</p>

Things I know I want to do:

* [Setup a recognisable image profile](#image-profile)
* Decide on typefaces, where they need to be a mix between unique-per-site and recognisable across sites
* Make a clearer connection between my sites

For the first step, let me go through how I create the sepia polaroid images.

<h2 id="image-profile">Image profile</h2>

For images, try to get as large as possible when working with them, and then crop down to whatever you're using it for. Several of the social medias recommend images that are at least 1500 pixels wide. Wattpad recommends that the author header is 1920x400! For Amazon author central, you can upload up to 8 pictures that are between 300x300 and 2500x2500, and I recommend you go with as large as you can on social media. Why? Because they likely have ways of dealing with the filesize. On your own site, however, you may want to be more prudent.

For profile images, make an image that is 2048x2048, and scale it depending on what that particular place allows. Most of the social media requires a square image, and Gravatar allows up to 2048x2048, which is why that is the largest image size I recommend.

For more details on (some) social media image sizes, check out [SproutSocial](sproutsocial.com/insights/social-media-image-sizes-guide/). As they are not thoroughly author-focused, I will later write a post expanding on the image sizes for author-based media such as Goodreads, Wattpad, Tablo and Amazon Author Central.

### Processing images

I use [Gimp](https://www.gimp.org/) to edit my images, partly because of the price for Photoshop, but more because I haven't had a computer that could handle Photoshop until the last year. [Mora Foto](http://www.mora-foto.it/en/tutorials-gimp/age-a-photo.html) is a good tutorial on how to age a photo, and it's what I base my process on.

1. Desaturate the image, using the Average option (to mimick the black-and-white photos)
2. Set foreground colour to `#dab383` or another sepia shade
3. Create a new layer that uses the foreground colour. Set the opacity to 40%, the mode to Overlay, and then merge down  (old photos yellow with time)
4. Set the contrast to -25
5. Duplicate the working layer. Use the Gaussian blur filter with a 20px radius or thereabouts. Set mode to Overlay and then merge down
6. Time to change the curves to simulate the bad exposure: at the top go upwards, at the bottom go downwards
7. Create a new layer that uses the foreground colour. Once again set the opacity to 40%, but the mode should be Darken only. Merge down
8. At this point, crop and scale to the appropriate size, since the final steps should be done on each individual image
9. To get the final touch of an old photo, [download this texture](/assets/resources/aging-texture.jpeg)(5.8Mb)
10. Open the texture as a layer, then scale (note: **don't crop**) the layer to fit the image. Set mode to Overlay and merge down
11. You may need to darken the image some, since the texture lightens it a fair bit
12. Optional: scale/crop to make images in different sizes, but try to avoid cropping since that ruins the texture

### CSS

For the polaroid part, I use a mix between padding, borders and a box-shadow. It's not an exact science, so make sure you do it based on your own images/site, though the principle is the same.

#### Padding

You'll want an equal padding around the entire image, except that at the bottom it should be twice that. If you are using a figure with some kind of caption (to get the "polaroid with scribbled text") effect, this should probably be on that element instead of the image.

#### Background & border

I like to set the border to a more transparent shade of the sepia colour I used, and the background colour to a lighter version of it. It should be close to white, but not be white (since that removes some of the sepia effect). The `.no-rgba`-class is set by Modernizr and affects IE8 and lower (I'm musing removing it, since that is an old enough browser).

#### Box-shadow

You'll want a dark, close to black, but doesn't need to be black, shadow with some transparency. I will share mine, but it might also need to be tweaked based on your site.

#### Code

I use SCSS, so I'll share first the code I use to set this up, and then what it compiles into:

##### SCSS
```
$color-secondary-1-3: #3F1D00;

%standard-box-shadow {
    box-shadow: 10px 10px 30px -10px rgba($color-secondary-1-3, 0.6)
}

%polaroid {
    padding: 8px;
    padding-bottom: 16px;
    background-color: lighten(#dab383, 25);
    border: rgba(#dab383, 0.2);
    .no-rgba & {
        border: #dab383;
    }
    @extend %standard-box-shadow;
}

.featured-image {
    @extend %polaroid;
}
```

##### CSS
```
.featured-image {
    padding: 8px 8px 16px;
    background-color: #f7efe5;
    border: rgba(218,179,131,.2);
    box-shadow: 10px 10px 30px -10px rgba(63,29,0,.6);
}

.no-rbga .featured-image {
    border: #dab383;
}
```
