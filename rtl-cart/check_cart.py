"""Run with Python, Playwright and Chrome against a local or published demo URL."""

import argparse
from pathlib import Path

from playwright.sync_api import expect, sync_playwright


def check_cart(page, address, width):
    page.goto(address)
    page.locator('#color').select_option('ivory')
    page.get_by_role('button', name='Add to cart').click()
    page.get_by_role('button', name='Add to cart').click()
    page.get_by_role('link', name='العربية').click()
    expect(page.locator('html')).to_have_attribute('lang', 'ar')
    expect(page.locator('html')).to_have_attribute('dir', 'rtl')
    assert page.evaluate('getComputedStyle(document.querySelector("article")).direction') == 'rtl'
    assert page.evaluate('document.documentElement.scrollWidth') <= width

    trigger = page.locator('#open-cart')
    trigger.press('Enter')
    dialog = page.get_by_role('dialog')
    expect(dialog).to_be_visible()
    expect(dialog.locator('#close')).to_be_focused()
    expect(dialog.get_by_test_id('variant')).to_have_text('عاجي')
    expect(dialog.get_by_test_id('cart-line')).to_have_count(1)
    expect(dialog.get_by_test_id('quantity')).to_have_text(
        page.evaluate('new Intl.NumberFormat("ar-AE").format(2)')
    )
    expect(dialog.get_by_test_id('total')).to_have_text(page.evaluate('''
      new Intl.NumberFormat("ar-AE", {style: "currency", currency: "AED"}).format(250)
    '''))
    page.keyboard.press('Shift+Tab')
    expect(dialog.get_by_role('button', name='إزالة')).to_be_focused()
    page.keyboard.press('Tab')
    expect(dialog.locator('#close')).to_be_focused()
    page.keyboard.press('Escape')
    expect(dialog).not_to_be_visible()
    expect(trigger).to_be_focused()

    page.get_by_role('link', name='English', exact=True).click()
    expect(page.locator('html')).to_have_attribute('dir', 'ltr')
    page.locator('#open-cart').press('Enter')
    expect(dialog.get_by_test_id('variant')).to_have_text('Ivory')
    expect(dialog.get_by_test_id('quantity')).to_have_text('2')
    dialog.get_by_role('button', name='Increase quantity').press('Enter')
    expect(dialog.get_by_test_id('quantity')).to_have_text('3')
    dialog.get_by_role('button', name='Remove').press('Enter')
    expect(dialog.get_by_test_id('cart-line')).to_have_count(0)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('url', help='URL of the static RTL cart fixture')
    parser.add_argument('--channel', choices=('chrome', 'msedge'), default='chrome')
    parser.add_argument('--screenshots', type=Path)
    args = parser.parse_args()

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel=args.channel)
        for width in (320, 390, 1280):
            page = browser.new_page(viewport={'width': width, 'height': 840})
            check_cart(page, args.url, width)
            if args.screenshots:
                args.screenshots.mkdir(parents=True, exist_ok=True)
                page.goto(args.url + '?lang=ar')
                page.locator('#add').click()
                page.locator('#open-cart').press('Enter')
                page.screenshot(path=args.screenshots / f'rtl-cart-{width}.png')
            page.close()
            print(f'{width}px: locale, variant, quantity, value and keyboard focus passed')
        browser.close()


if __name__ == '__main__':
    main()
