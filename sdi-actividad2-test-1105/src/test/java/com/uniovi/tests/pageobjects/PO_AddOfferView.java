package com.uniovi.tests.pageobjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;


public class PO_AddOfferView extends PO_View {

	static public void fillForm(WebDriver driver, String titlep, String descriptionp, String pricep) {
		WebElement title = driver.findElement(By.name("titulo"));
		title.click();
		title.clear();
		title.sendKeys(titlep);
		WebElement description = driver.findElement(By.name("descripcion"));
		description.click();
		description.clear();
		description.sendKeys(descriptionp);
		WebElement price = driver.findElement(By.name("precio"));
		price.click();
		price.clear();
		price.sendKeys(pricep);
		By boton = By.className("btn");
		driver.findElement(boton).click();
	}
}
