import { test, expect } from '@playwright/test';

/* 
Frontend doesn't react consistently (buttons do not react on click, etc.), 
therefore test cases might fail.
Nevertheless I tried to fail-proof the code as good as possible (e.g. assertion for non-visibility)
*/

// setup 
test.beforeEach(async ({ page }) => {
    await page.goto("http://127.0.0.1:8080/")
    await expect(page).toHaveTitle("qa-automation-engineer-challenge")

    // In setup the test always clicks the first option of the reschedule list to make sure, 
    // the second test case works properly and consistently
    await page.locator('#test_reschedule_button').click()
    await expect(page.locator('.reschedule-options')).toBeVisible()
    const task_list = page.locator('.reschedule-options').getByRole('button')
    await task_list.nth(0).click()
    await expect(page.locator('.reschedule-options')).not.toBeVisible()
  });

// tests
test('can see all appointment details', async ({ page }) => {
    await expect(page.locator('.appointment-details')).toBeVisible()
    await expect(page.locator('#test_date_day')).toBeVisible()

    // I use funky Regex to match the values in this test case; would be better to have ids for the values!
    await expect(page.locator('#test_time_paragraph')).toContainText(/\d\d:\d\d - \d\d:\d\d/, { useInnerText: true }) 

    await expect(page.locator('#test_technician_task_paragraph')).toBeVisible()
    await expect(page.locator('#test_technician_task_paragraph')).toContainText(/[A-Z]?[a-z].*/, { useInnerText: true }) 
    

    await expect(page.locator('.technician-details')).toBeVisible()
    await expect(page.locator('#test_technician_name_paragraph')).toBeVisible()
    await expect(page.locator('#test_technician_name_paragraph')).toContainText(/[A-Z]?[a-z].*/, { useInnerText: true }) 

    await expect(page.locator('#test_technician_age_paragraph')).toBeVisible()
    await expect(page.locator('#test_technician_age_paragraph')).toContainText(/\d\d/, { useInnerText: true }) 

    await expect(page.locator('#test_technician_sex_paragraph')).toBeVisible()
    await expect(page.locator('#test_technician_sex_paragraph')).toContainText(/[A-Z]?[a-z].*/, { useInnerText: true }) 

    await expect(page.locator('#test_reschedule_button')).toBeVisible()
})

test('can reschedule appointment', async ({ page }) => {

    // get date before reschedule
    let before_date = await page.locator('#test_date_day').innerText()

    await expect(page.locator('#test_reschedule_button')).toBeVisible()
    await expect(page.locator('#test_reschedule_button')).toBeEnabled()

    await page.locator('#test_reschedule_button').click()
    await expect(page.locator('.reschedule-options')).toBeVisible()

    const task_list = page.locator('.reschedule-options').getByRole('button')
 
    // Loop over all elements in the reschedule list, to make sure the given amount of possibilities are present
    for (let index = 0; index < (await task_list.all()).length; index++) {
        const element = task_list.nth(index);
        await expect(element).toBeVisible()        
    }
    await expect(task_list).toHaveCount(3)
    
    // We click last element since the first element is always the currently chosen appointment (behaviour should be different!)
    await task_list.nth(2).click()
    await expect(page.locator('.reschedule-options')).not.toBeVisible()
    expect(before_date).not.toEqual(await page.locator('#test_date_day').innerText({timeout: 1000}))
})