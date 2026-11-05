import importlib.util
from pathlib import Path
import unittest

spec=importlib.util.spec_from_file_location('photos',Path(__file__).with_name('collect-commons-photos.py'))
p=importlib.util.module_from_spec(spec);spec.loader.exec_module(p)


def image(title='File:Example.jpg',description='Example bird',categories='Example bird',license='CC BY-SA 4.0',url='https://creativecommons.org/licenses/by-sa/4.0/'):
    return {'title':title,'imageinfo':[{'mime':'image/jpeg','width':1600,'height':1000,'url':'https://upload.wikimedia.org/example.jpg',
             'extmetadata':{'Artist':{'value':'Photographer'},'LicenseShortName':{'value':license},'LicenseUrl':{'value':url},
                            'ImageDescription':{'value':description},'Categories':{'value':categories}}}]}


class CollectionTests(unittest.TestCase):
    def test_sex_labels_exclude_photographer_names_and_juveniles(self):
        self.assertEqual(p.sex_evidence('Bird.jpg',{'Categories':{'value':'Images by Drow male|Birds in Spain'}})[0],[])
        self.assertEqual(p.sex_evidence('Emberiza example male.jpg',{})[0],['male'])
        self.assertEqual(p.sex_evidence('Bird.jpg',{},'Female')[0],['female'])
        self.assertEqual(p.sex_evidence('Juvenile male bird.jpg',{})[0],[])
        self.assertEqual(p.sex_evidence('Bird.jpg',{},'Pair: male left and female right')[0],['male','female'])

    def test_article_membership_does_not_override_wrong_image_identity(self):
        entry={'taxonNames':['Oenanthe leucopyga'],'wikiTitle':'White-crowned wheatear'}
        wrong=image('File:Red-rumped wheatear Oenanthe moesta.jpg','Oenanthe moesta','Oenanthe moesta')
        self.assertFalse(p.belongs(wrong['title'],wrong,{'origin':'species article lead image'},entry))
        right=image('File:White-crowned wheatear.jpg','Oenanthe leucopyga','Oenanthe leucopyga')
        self.assertTrue(p.belongs(right['title'],right,{'origin':'species article lead image'},entry))

    def test_licensing_mixed_species_and_art_rejections(self):
        self.assertTrue(p.usable(image()))
        self.assertFalse(p.usable(image(license='GFDL',url='https://gnu.org/licenses/fdl')))
        self.assertFalse(p.usable(image(categories='Passerina cyanea with other species|Catharus minimus with other species')))
        self.assertFalse(p.usable(image('File:Girl and parrot painting.jpg',categories='Paintings|Female nudes')))
        self.assertFalse(p.usable(image('File:Dusky Thrush female.jpg')))
        self.assertEqual(p.license_info(image(license='Public domain',url='')['imageinfo'][0])[0],'Public domain')

    def test_sexual_behaviour_is_not_plumage_dimorphism(self):
        def article(text):return {'revisions':[{'slots':{'main':{'content':text}}}]}
        self.assertEqual(p.dimorphism(article('The female incubates while the male guards the nest.'))['assessment'],'not-established')
        self.assertEqual(p.dimorphism(article('Both sexes are similar in colouration.'))['assessment'],'similar')
        self.assertEqual(p.dimorphism(article('The male is brightly marked. The female is duller.'))['assessment'],'dimorphic')

    def test_infobox_and_gallery_captions(self):
        page={'revisions':[{'slots':{'main':{'content':' | image2 = Female.jpg\n | image2_caption = Female\n<gallery>\nMale.jpg|Male in breeding plumage\n</gallery>'}}}]}
        files=p.article_files(page)
        self.assertEqual(files['Female.jpg']['caption'],'Female')
        self.assertEqual(files['Male.jpg']['caption'],'Male in breeding plumage')



inat_spec=importlib.util.spec_from_file_location('inat',Path(__file__).with_name('collect-inaturalist-photos.py'))
inat=importlib.util.module_from_spec(inat_spec);inat_spec.loader.exec_module(inat)

class ObservationTests(unittest.TestCase):
    def test_requires_exact_research_grade_taxon(self):
        observation={'quality_grade':'research','taxon':{'id':42},'annotations':[]}
        self.assertTrue(inat.usable_observation(observation,42))
        self.assertFalse(inat.usable_observation(observation,43))
        observation['quality_grade']='needs_id'
        self.assertFalse(inat.usable_observation(observation,42))

    def test_sex_annotation_and_adult_evidence(self):
        annotation={'controlled_attribute_id':9,'controlled_value_id':10,'vote_score':0}
        observation={'quality_grade':'research','taxon':{'id':42},'annotations':[annotation]}
        self.assertTrue(inat.usable_observation(observation,42,10))
        self.assertFalse(inat.usable_observation(observation,42,11))
        annotation['vote_score']=-1
        self.assertFalse(inat.usable_observation(observation,42,10))
        annotation['vote_score']=0
        observation['annotations'].append({'controlled_attribute_id':1,'controlled_value_id':8,'vote_score':0})
        self.assertFalse(inat.usable_observation(observation,42,10))

    def test_individual_photo_license_and_resolution(self):
        photo={'license_code':'cc-by','original_dimensions':{'width':1000,'height':600}}
        self.assertTrue(inat.eligible_photo(photo))
        for license in [None,'cc-by-nc','cc-by-nd','all rights reserved']:
            photo['license_code']=license
            self.assertFalse(inat.eligible_photo(photo))
        photo['license_code']='cc0';photo['original_dimensions']['height']=120
        self.assertFalse(inat.eligible_photo(photo))

class EggExclusionTests(unittest.TestCase):
    def test_egg_without_egg_in_filename(self):
        self.assertFalse(p.usable(image(title='File:Vautour africain MHNT.jpg',description='Egg of White-backed Vulture',categories='Gyps eggs')))

if __name__=='__main__':unittest.main()
